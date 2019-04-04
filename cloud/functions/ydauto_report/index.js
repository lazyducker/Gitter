const cache = require('memory-cache')

const { fetchGlassRepairRecords } = require('./fetch')
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    const { sdate, edate } = event
    let res = null;

    res = await fetchGlassRepairRecords({ sdate, edate });
    console.log("最终返回: ", res);  
  return {
    data: res
  }
}



