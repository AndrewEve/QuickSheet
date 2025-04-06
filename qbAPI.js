const tempTokens = [];

class TimedBoolean {
    constructor(duration) {
        this.value = true;
        setTimeout(() => {
            this.value = false;
        }, duration);
    }
}

function upsertToken(tkn) {
    const index = tempTokens.findIndex(obj => obj.id === tkn.id);
    
    if (index !== -1) {
        // Update existing object
        tempTokens[index] = { ...tempTokens[index], ...tkn };
    } else {
        // Add new object
        tempTokens.push(tkn);
    }
}

async function tempToken(dbid, realm) {
    let existingToken = tempTokens.find(item => item.id === dbid);    
    if( existingToken !== undefined && existingToken !== null && !existingToken.expired){
            return existingToken.temporaryAuthorization;
    }
    
    const url = "https://api.quickbase.com/v1/auth/temporary/"+dbid;
    try {
        const response = await fetch(url,
            {
                method: "GET",
                headers: {
                    "QB-Realm-Hostname": realm,
                    "Content-Type": "application/json"
                },
                credentials: "include"
            }
        );
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        let tempTkn = {
            "temporaryAuthorization": json.temporaryAuthorization, 
            "id": dbid,
            "expired": new TimedBoolean(240000)
        };
        upsertToken(tempTkn);
        return json.temporaryAuthorization;
    } catch (error) {
        console.error(error.message);
    }
}

async function updateCodePage(dbid, realm, pageInfo, pageName, apptoken = null) {
    try {
        const url = "https://"+ realm + "/db/"+dbid;
        apptoken = apptoken === null ? "" : `<apptoken>${apptoken}</apptoken>`;
        const response = await fetch(url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/xml",
                    "QUICKBASE-ACTION": "API_AddReplaceDBPage"
                },
                body: `<qdbapi>
                <pagename>${pageName}</pagename>
                <pagetype>1</pagetype>
                          <pagebody><![CDATA[${pageInfo}]]></pagebody>
                ${apptoken}
                </qdbapi>`,
                credentials: "include"
            }
        );
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const xml = await response.text();
        return xml;
    } catch (error) {
        console.error(error.message);
    }
}

async function queryData(dbid, fields, filter, realm, sort = null) {
    try {
        const url = "https://api.quickbase.com/v1/records/query";
        const token = await tempToken(dbid, realm);
        const response = await fetch(url,
            {
                method: "POST",
                headers: {
                    "QB-Realm-Hostname": realm,
                    "Content-Type": "application/json",
                    "Authorization": "QB-TEMP-TOKEN " + token
                },
                body: JSON.stringify({
                    "from": dbid,
                    "select": fields,
                    "where": filter
                })
            }
        );
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

async function removeRecords(dbid, filter, realm) {
    try {
        const url = "https://api.quickbase.com/v1/records";
        const token = await tempToken(dbid, realm);
        const response = await fetch(url,
            {
                method: "DELETE",
                headers: {
                    "QB-Realm-Hostname": realm,
                    "Content-Type": "application/json",
                    "Authorization": "QB-TEMP-TOKEN " + token
                },
                body: JSON.stringify({
                    "from": dbid,
                    "where": filter
                })
            }
        );
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

async function runReport(dbid, reportID, realm, fullReport = true, skip = 0, data = []) {
    try {
        const url = "https://api.quickbase.com/v1/reports/"+reportID+"/run?tableId="+dbid+"&skip="+skip;
        const token = await tempToken(dbid, realm);
        const response = await fetch(url,
            {
                method: "POST",
                headers: {
                    "QB-Realm-Hostname": realm,
                    "Content-Type": "application/json",
                    "Authorization": "QB-TEMP-TOKEN " + token
                }
            }
        );
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }
        
        const json = await response.json();
        let currCount = json.metadata.numRecords + skip;
        if((currCount) >= (json.metadata.totalRecords) || !fullReport) {
            json.data = data.concat(json.data);
            return json;
        } else {
            return runReport(dbid, reportID, realm, pBar, pLabel, currCount, data.concat(json.data));
        }
    } catch (error) {
        console.error(error.message);
    }
}



async function getTables(dbid, realm) {
    try {
        const url = "https://api.quickbase.com/v1/tables?appId="+dbid;
        const token = await tempToken(dbid, realm);
        const response = await fetch(url,
            {
                method: "GET",
                headers: {
                    "QB-Realm-Hostname": realm,
                    "Content-Type": "application/json",
                    "Authorization": "QB-TEMP-TOKEN " + token
                }
            }
        );
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

async function getFields(dbid, realm) {
    try {
        const url = "https://api.quickbase.com/v1/fields?tableId="+dbid;
        const token = await tempToken(dbid, realm);
        const response = await fetch(url,
            {
                method: "GET",
                headers: {
                    "QB-Realm-Hostname": realm,
                    "Content-Type": "application/json",
                    "Authorization": "QB-TEMP-TOKEN " + token
                }
            }
        );
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

async function getRels(dbid, realm) {
    try {
        const url = "https://api.quickbase.com/v1/tables/" + dbid + "/relationships";
        const token = await tempToken(dbid, realm);
        const response = await fetch(url,
            {
                method: "GET",
                headers: {
                    "QB-Realm-Hostname": realm,
                    "Content-Type": "application/json",
                    "Authorization": "QB-TEMP-TOKEN " + token
                }
            }
        );
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

async function getReports(dbid, realm) {
    try {
        const url = "https://api.quickbase.com/v1/reports?tableId="+dbid;
        const token = await tempToken(dbid, realm);
        const response = await fetch(url,
            {
                method: "GET",
                headers: {
                    "QB-Realm-Hostname": realm,
                    "Content-Type": "application/json",
                    "Authorization": "QB-TEMP-TOKEN " + token
                }
            }
        );
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

async function upsert(dbid, realm, data) {
    try {
        const url = "https://api.quickbase.com/v1/records";
        const token = await tempToken(dbid, realm);
        const response = await fetch(url,
            {
                method: "POST",
                headers: {
                    "QB-Realm-Hostname": realm,
                    "Content-Type": "application/json",
                    "Authorization": "QB-TEMP-TOKEN " + token
                },
                body: JSON.stringify(data)
            }
        );
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

function transformData(json){

    // Extract headers (field labels)
    const headers = json.fields.map(field => field.label);

    // Convert the data to a 2D array
    const dataArray = json.data.map(record => {
        return json.fields.map(field => record[field.id].value);
    });

    // Combine headers with dataArray to create a 2D array for Excel
    const excelArray = [headers, ...dataArray];
    return excelArray;
}