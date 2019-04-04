const rp = require('request-promise')

const GITHUB_URL = 'http://report.zhangyukj.com/vehicle-dashboard';

async function fetchGlassRepairRecords({
    sdate = '',
    edate = '',
  } = {}) {
    const url = `${GITHUB_URL}/glassreport/data/repair/monthly?sdate=${sdate}&edate=${edate}`;
    
    const report_req = {
        method: 'GET',
        url: url,
        qs: {
          sdate
        },
        json: true
      };

    const data = await rp(report_req);
    console.log("返回的结果数1: ", data);


    return data;
  }

exports.fetchGlassRepairRecords = fetchGlassRepairRecords
