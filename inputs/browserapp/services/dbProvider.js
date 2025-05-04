const User = require('../../../models/userModel');
const _ = require('lodash');
const listenerService = require('../../../listeners/eventsListener');

const dbProvider = {
  async gridFetch({ objectHierarchy, recordId } = {}, listenerName) {
    if (!recordId || !objectHierarchy) return;

    const getChildByType = (children, type) => _.filter(children, { objectType: type });

    const fetchOneToOneChildren = async (oneToOneArray, parentRec) => {
      return Promise.all(oneToOneArray.map(async ({ objectName, fieldName, childObject }) => {
        const refId = parentRec?.id?.split('_2_')[1];
        if (!refId) return;

        const query = {
          $and: [
            { field: 'type', operator: '==', value: objectName },
            { field: fieldName, operator: '==', value: refId }
          ],
          $includeFields: true,
        };

        const res = await User.searchDoc(query);
        const childRec = res?.docs?.[0];
        if (childRec) {
          listenerService.notifyListeners(listenerName, { records: childRec, status: 'inprogress' });
          return handleResponse(childObject, childRec);
        }
      }));
    };

    const fetchHeaderChildren = async (headerArray, parentRec) => {
      return Promise.all(headerArray.map(async ({ objectName, fieldName, childObject }) => {
        const headerId = `${objectName}_2_${parentRec[fieldName]}`;
        const res = await User.allDocById(headerId);
        if (res?.id) {
          listenerService.notifyListeners(listenerName, { records: res, status: 'inprogress' });
          return handleResponse(childObject, res);
        }
      }));
    };

    const handleResponse = async (childObject = [], parentRec) => {
      if (!childObject?.length) return;

      const oneToOneArray = getChildByType(childObject, 'one_to_one');
      const headerArray = getChildByType(childObject, 'header');

      await Promise.all([
        fetchOneToOneChildren(oneToOneArray, parentRec),
        fetchHeaderChildren(headerArray, parentRec)
      ]);
    };

    const primaryRec = await User.allDocById(recordId);
    if (primaryRec?.id) {
      listenerService.notifyListeners(listenerName, { records: primaryRec, status: 'inprogress' });
      await handleResponse(objectHierarchy.childObject, primaryRec);
    }

    listenerService.notifyListeners(listenerName, {records: [], status: 'completed'});
  },

  async listFetch({ objectHierarchy }, listenerName) {
    const groupChildrenByType = (children) => _.groupBy(children, 'objectType');

    const fetchOneToOneChildren = async (oneToOneArray, parentRec) => {
      const refId = parentRec?.id?.split('_2_')[1];
      if (!refId || !oneToOneArray.length) return [];

      const queries = oneToOneArray.map(({ objectName, fieldName }) => ({
        $and: [
          { field: 'type', operator: '==', value: objectName },
          { field: fieldName, operator: '==', value: refId }
        ],
        $includeFields: true,
      }));

      const promises = queries.map((query, i) => User.searchDoc(query)
        .then(res => {
          const childRec = res?.docs?.[0];
          if (childRec) {
            const child = oneToOneArray[i];
            listenerService.notifyListeners(listenerName, { records: childRec, rootPath: child.rootPath, status: 'inprogress' });
            return handleResponse(child.childObject, childRec);
          }
        })
      );

      return Promise.all(promises);
    };

    const fetchHeaderChildren = async (headerArray, parentRec) => {
      if (!headerArray.length) return [];

      const promises = headerArray.map(async ({ objectName, fieldName, childObject }) => {
        const headerId = `${objectName}_2_${parentRec[fieldName]}`;
        const res = await User.allDocById(headerId);
        if (res?.id) {
          listenerService.notifyListeners(listenerName, { records: res, rootPath: childObject['rootPath'], status: 'inprogress' });
          return handleResponse(childObject, res);
        }
      });

      return Promise.all(promises);
    };

    const handleResponse = async (childObject, parentRec) => {
      if (!Array.isArray(childObject) || childObject.length === 0) return;

      const groupedChildren = groupChildrenByType(childObject);
      const oneToOneArray = groupedChildren['one_to_one'] || [];
      const headerArray = groupedChildren['header'] || [];

      await Promise.all([
        fetchOneToOneChildren(oneToOneArray, parentRec),
        fetchHeaderChildren(headerArray, parentRec)
      ]);
    };

    const query = {
      $and: [
        { field: 'type', operator: '==', value: objectHierarchy['objectName'] }
      ],
      $sort: { field: 'createdon', direction: 'asc' },
      $includeFields: objectHierarchy['includeFields'],
    };

    const primaryRes = await User.searchDoc(query);
    const docs = primaryRes?.docs || [];

    await Promise.all(
      docs.map(async (element) => {
        listenerService.notifyListeners(listenerName, {
          records: element,
          rootPath: objectHierarchy['rootPath'],
          status: 'inprogress'
        });
        return handleResponse(objectHierarchy.childObject, element);
      })
    );

    listenerService.notifyListeners(listenerName, { records: {}, status: 'completed' });
  }
  
};

module.exports = dbProvider;
