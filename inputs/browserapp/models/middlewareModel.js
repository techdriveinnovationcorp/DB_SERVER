const _ = require('lodash');
const User = require('../../../models/userModel');
const dbProvider = require('../services/dbProvider');
const moment = require('moment');

const generateDateFormat = (format) => {
    return format
        .replace(/MM/g, 'MM')
        .replace(/YY/g, 'YY')
        .replace(/DD/g, 'DD')
        .replace(/MONTH/g, 'MMMM')
        .replace(/MON/g, 'MMM');
};

const generateAutoNumber = async (config, objectName) => {
    const taskArray = await Promise.all(config.map(async (ele) => {
        if (ele === "{0}") {
            return User.getCountBasedOnType(objectName);
        } else if (ele.startsWith("{") && ele.endsWith("}")) {
            return moment().format(generateDateFormat(ele.slice(1, -1)) || "DD/MM/YY");
        }
        return ele;
    }));

    return taskArray.join("");
};

const middleware = {

    async saveWithValidation(saveParams) {
        const { dataSet, objectHierarchy, autoNumberConfigJson } = saveParams;
        let saveResponseSet = {};

        const getChild = (childJsonArray, objectType) => _.filter(childJsonArray, { objectType });

        const handleResponse = async (childObject, recId) => {
            const idPart = recId.split("_2_")[1];

            let promises = [];
            
            // One-to-One relationships (parallelized)
            for (const obj of getChild(childObject, 'one_to_one')) {
                _.set(dataSet, [obj.objectName, obj.fieldName], idPart);
                promises.push(processSave(obj));
            }

            // One-to-Many relationships (parallelized)
            for (const obj of getChild(childObject, 'one_to_many')) {
                dataSet[obj.objectName].forEach(childRec => _.set(childRec, obj.fieldName, idPart));
                promises.push(processSave(obj));
            }

            await Promise.all(promises);
        };

        const processSave = async (hierarchyJson) => {
            try {
                const saveData = _.get(dataSet, hierarchyJson.objectName);
                if (!saveData) return { status: 'FAILED', message: 'No data to save' };

                if (autoNumberConfigJson[hierarchyJson.objectName]) {
                    const { fieldName, config, objectName } = autoNumberConfigJson[hierarchyJson.objectName];
                    if (!_.get(saveData, fieldName)) {
                        _.set(saveData, fieldName, await generateAutoNumber(config, objectName));
                    }
                }

                const saveResponse = await User.save(saveData);
                _.set(saveResponseSet, hierarchyJson.objectName, saveResponse);

                if (saveResponse.status === "SUCCESS" && saveResponse.id && !_.isEmpty(hierarchyJson.childObject)) {
                    await handleResponse(hierarchyJson.childObject, saveResponse.id);
                }

                return { status: 'SUCCESS', saveResponseSet };
            } catch (error) {
                return { status: 'FAILED', message: 'Failed to save', error };
            }
        };

        return processSave(objectHierarchy);
    },

    async gridStreamFetchWithHierarchy (fetchParams) {

        

    }

};

module.exports = middleware;
