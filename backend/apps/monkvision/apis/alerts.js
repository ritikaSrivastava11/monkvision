/** 
 * Returns MonBoss or CyberWarrior alert file's contents.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

const db = require(`${APP_CONSTANTS.LIB_DIR}/db.js`);
const utils = require(`${APP_CONSTANTS.LIB_DIR}/utils.js`);

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
    const logid="monboss.log";
    //Ritika commented : to change getAlerts to getAlerts_System ,for temporary use
	// const rows = await db.getAlerts(utils.getTimeRangeForSQLite(JSON.parse(jsonReq.timeRange)));
    const rows = await db.getAlerts_System(logid,utils.getTimeRangeForSQLite(JSON.parse(jsonReq.timeRange)));
    if (!rows) {LOG.error(`DB read issue: ${err}`); return CONSTANTS.FALSE_RESULT;}
    
    let contents = [];
    for (const row of rows) contents.push(`Time: ${utils.fromSQLiteToUTCOrLocalTime(row.timestamp, jsonReq.notUTC)}\nError: ${row.error}\nAdditional information: ${row.additional_err||""}\nSystem: ${row.system||""}\n\n`);
    
    const result = {result: true, type: "text", contents};
    if (jsonReq.title) result.contents.title = jsonReq.title; return result;
}

const validateRequest = jsonReq => (jsonReq && jsonReq.timeRange);