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
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
    
    const rows = await db.getLogs(jsonReq.id, utils.getTimeRangeForSQLite(JSON.parse(jsonReq.timeRange)));
    if (!rows) {LOG.error("DB read issue"); return CONSTANTS.FALSE_RESULT;}
    const x = [], y = [], y1=[],y2=[],y3=[],y4=[],y5=[],y6=[],info = [],infoCPU=[],infoDISK=[],infoRAM=[], falseStatusValue = jsonReq.statusFalseValue?jsonReq.statusFalseValue:0.1,
        trueStatusValue = jsonReq.statusTrueValue?jsonReq.statusTrueValue:1;
        //ritika
        let count=0;
    for (const row of rows) {
        //ritika
        count++;
        x.push(utils.fromSQLiteToUTCOrLocalTime(row.timestamp, jsonReq.notUTC));
            try{
                if(Array.isArray(JSON.parse(row.additional_status))){
                    LOG.info(` count is ${count}`);
                        LOG.info(`add status string ${JSON.stringify(row.additional_status)}`);
                        LOG.info(`add status parse ${JSON.parse(row.additional_status)}`);
    
                    // LOG.info(`Query_last_run_time is ${(JSON.parse(row.additional_status)[51]).Query_last_run_time}`);
    
                     for( let index=0;index<JSON.parse(row.additional_status).length;index++){
                        let Query_database=(JSON.parse(row.additional_status)[index]).Query_database;
                        let Query_last_run_time=(JSON.parse(row.additional_status)[index]).Query_last_run_time;
                        let Query_average_cpu_time=(JSON.parse(row.additional_status)[index]).Query_average_cpu_time;
                        let Query_average_network_time=(JSON.parse(row.additional_status)[index]).Query_average_network_time;
                        let Query_average_elapsed_time=(JSON.parse(row.additional_status)[index]).Query_average_elapsed_time;
                        let Query_text=(JSON.parse(row.additional_status)[index]).Query_text;
    
                        y1.push(Query_database);
                        y2.push(Query_last_run_time);
                        y3.push(Query_average_cpu_time);
                        y4.push(Query_average_network_time);
                        y5.push(Query_average_elapsed_time);
                        y6.push(Query_text);
        
                        // info.push(!JSON.parse(row.additional_status)[index] || JSON.parse(row.additional_status)[index]=="" ? 
                        // (jsonReq.nullValue?jsonReq.nullValue:JSON.parse(row.additional_status)[index]) : JSON.parse(row.additional_status)[index]);
                        // info.push(!row.additional_status[index] || row.additional_status[index]=="" ? 
                        // (jsonReq.nullValue?jsonReq.nullValue:row.additional_status[index]) : row.additional_status[index]);
                    }
                }
            }catch(e){
                LOG.error(`Error incountered and catched: ${e}`);
            }

    }
    // LOG.info(`y1 is ${y1}`);
    const result = {result: true, type: "table", contents: {length:x.length,x,ys:[y1,y2,y3,y4,y5,y6],infos:[info]}}; 
    if (jsonReq.title) result.contents.title = jsonReq.title; return result;
}

const validateRequest = jsonReq => (jsonReq && jsonReq.id && jsonReq.timeRange);