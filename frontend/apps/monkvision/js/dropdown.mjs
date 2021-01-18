import {chart_box} from "../components/chart-box/chart-box.mjs"; window.chart_box = chart_box;

async function populateDropdown(clusterTitle) { 
    const api="nodeListGenerator";
    const response = await monkshu_env.components['chart-box']._getContent(api,"clusterName="+clusterTitle);
    
    let dropdown = document.querySelector("select#nodeDropdown"); 
    const selectedNode=dropdown.getAttribute("selectedNode");

    response.nodeList.forEach((item ,index)=> {
        let options = document.createElement("option"); 
        options.textContent = item; 
        options.value = index; 
        if(item==selectedNode)
            options.selected=true;
        dropdown.appendChild(options); 
    });
}	

export const dropdown = {populateDropdown};