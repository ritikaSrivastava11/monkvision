/** 
 * Returns MonBoss or CyberWarrior log file's contents.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */
const db = require(`${APP_CONSTANTS.LIB_DIR}/db.js`);
const utils = require(`${APP_CONSTANTS.LIB_DIR}/utils.js`);

/**
 * Returns the log entries from MonBoss, or MonBoss type DBs. Note this API works in UTC unless the local
 * time adjustment flag is specified. 
 * @param {object} jsonReq Incoming request, must have the following
 *                  id - The ID of the log
 *                  timeRange - String in this format -> `{from:"UTC Time", to: "UTC Time"}`
 *                  
 *              Optionally
 *                  statusFalseValue - If status is false, then return it as this value, used only if statusAsBoolean - false
 *                  statusTrueeValue - If status is true, then return it as this value, used only if statusAsBoolean - false
 *                  statusAsBoolean - Return status as a boolean variable, not values
 *                  nullValue - If additonal status is null or empty return it as this value
 *                  notUTC - Return results in server's local time not UTC
 */
exports.doService = async jsonReq => {
    if (!validateRequest(jsonReq)) {
        LOG.error("Validation failure.");
        return CONSTANTS.FALSE_RESULT;
    }

    //Ritika code starts : for fetching node list to show in dropdown
    const logid_nodelist="shell_mon__bin_bash_c__home_monboss_monboss_scripts_nodes_list_generator_dashboard_sh__primary_";
    const rowsNodeList = await db.getLogs(logid_nodelist, utils.getTimeRangeForSQLite(JSON.parse(jsonReq.timeRange)));
    let list=[];
    if (!rowsNodeList) {
        LOG.error("DB read issue for fetching node list");
        return CONSTANTS.FALSE_RESULT;
    }

    for (let row of rowsNodeList) {
        for(let key of Object.keys(JSON.parse(row.additional_status).node_id)){
            list.push(key);
        }
        break;
    }
    //Ritika code ends : for fetching node list to show in dropdown

    const rows = await db.getLogs(jsonReq.id, utils.getTimeRangeForSQLite(JSON.parse(jsonReq.timeRange)));
    if (!rows) {
        LOG.error("DB read issue");
        return CONSTANTS.FALSE_RESULT;
    }

    let x = [],yArrays=[],infoArrays=[];
    // For dynamic number of ys and infos array
for (let i = 0; i<list.length;i++){
    eval("var y"+i+"=[]");
    eval("var info"+i+"=[]");
    yArrays.push(eval("y"+i));
    infoArrays.push(eval("info"+i));
}

    for (let row of rows) {
        x.push(utils.fromSQLiteToUTCOrLocalTime(row.timestamp, jsonReq.notUTC));
        let parsedAddStatus;
        try {
            parsedAddStatus = JSON.parse(row.additional_status);
            list.forEach((_node,index) => {
                eval("y"+index+".push((parsedAddStatus[_node]).total_space_percentage)");
                eval("info"+index+".push((parsedAddStatus[_node]).total_space_percentage)");
            })
        } catch (e) {
            LOG.error(`Error incountered and catched: ${e}`);
            for (let i = 0; i<list.length;i++){
            eval("y"+i+".push(0.5)");
            }

        }

    }

    const result = {
        result: true,
        type: "linegraph",
        contents: {
            length: x.length,
            x,
            ys: yArrays,
            infos: infoArrays
            // ys: [y, y1, y2, y3],
            // infos: [infoMaster,infoAgg,infoLeaf1,infoLeaf2]
        },
        nodeList : list
    };
    if (jsonReq.title) result.contents.title = jsonReq.title;
    return result;
}

const validateRequest = jsonReq => (jsonReq && jsonReq.id && jsonReq.timeRange);