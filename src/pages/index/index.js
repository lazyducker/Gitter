import Taro, { Component } from '@tarojs/taro'
import { View, Picker, Text, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import { GLOBAL_CONFIG } from '../../constants/globalConfig'
import { languages } from '../../utils/language'
import { get as getGlobalData, set as setGlobalData  } from '../../utils/global_data'
import { AtNoticebar } from 'taro-ui'

import ItemList from '../../components/index/itemList'
import ArticleList from '../../components/interview/articleList'
import DashboardHome from '../../components/interview/dashboardHome'
import Segment from '../../components/index/segment'
import Empty from '../../components/index/empty'

import './index.less'

class Index extends Component {

  config = {
    navigationBarTitleText: 'Trending',
    enablePullDownRefresh: true
  }

  constructor (props) {
    super(props)
    this.state = {
      current: 0,
      category: {
        'name': 'Today',
        'value': 'daily'
      },
      language: {
        'name': 'All',
        'urlParam': ''
      },
      animation: null,
      isHidden: false,
      fixed: false,
      notice: null,
      notice_closed: false,
      repos: [],
      articles:[],
      developers: [],
      range: [
        [{'name': 'Today',
        'value': 'daily'},
        {'name': 'Week',
          'value': 'weekly'},
        {'name': 'Month',
          'value': 'monthly'}],
        languages
      ]
    }
  } 

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentDidMount() {
    Taro.showLoading({title: GLOBAL_CONFIG.LOADING_TEXT})
    this.loadLanguages()
    this.loadItemList()
    this.loadNotice()

    let that = this
    Taro.getSystemInfo({
      success(res) {
        that.setState({
          windowHeight: res.windowHeight - (res.windowWidth / 750) * 80
        })
      }
    })
  }

  componentWillUnmount () { }

  componentDidShow () {
    this.updateLanguages()
  }

  componentDidHide () { }

  onPullDownRefresh() {
    this.loadItemList()
  }

  onPageScroll(obj) {
    const { fixed } = this.state
    if (obj.scrollTop > 0) {
      if (!fixed) {
        this.setState({
          fixed: true
        })
      }
    } else {
      this.setState({
        fixed: false
      })
    }
  }

  onScroll(e) {
    if (e.detail.scrollTop < 0) return;
    if (e.detail.deltaY > 0) {
      let animation = Taro.createAnimation({
        duration: 400,
        timingFunction: 'ease',
      }).bottom(25).step().export()
      this.setState({
        isHidden: false,
        animation: animation
      })
    } else {
      //向下滚动
      if (!this.state.isHidden) {
        let animation = Taro.createAnimation({
          duration: 400,
          timingFunction: 'ease',
        }).bottom(-95).step().export()
        this.setState({
          isHidden: true,
          animation: animation
        })
      }
    }
  }

  onChange = e => {
    this.setState({
      category: this.state.range[0][e.detail.value[0]],
      language: this.state.range[1][e.detail.value[1]]
    }, () => {
      Taro.showLoading({title: GLOBAL_CONFIG.LOADING_TEXT})
      this.loadItemList()
    })
  }

  loadReportList () {
    let that = this
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'ydauto_report',
      // 传递给云函数的event参数
      data: {
        sdate: '2018-01-01',
        edate: '2019-09-24'
      }
    }).then(res => {
      console.log('回调函数: ', res);
    }).catch(err => {
      Taro.hideLoading()
      Taro.stopPullDownRefresh()
    })
  }

  loadItemList () {
    const { current } = this.state
    let that = this
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'trend',
      // 传递给云函数的event参数
      data: {
        type: 'repositories',
        language: that.state.language.urlParam,
        since: that.state.category.value
      }
    }).then(res => {
      that.setState({
        repos: res.result.data,
        articles: res.result.data
      }, ()=>{
        Taro.pageScrollTo({
          scrollTop: 0
        })
        if (current === 0) {
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
        }
      })
    }).catch(err => {
      Taro.hideLoading()
      Taro.stopPullDownRefresh()
    })

    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'trend',
      // 传递给云函数的event参数
      data: {
        type: 'developers',
        language: that.state.language.urlParam,
        since: that.state.category.value
      }
    }).then(res => {
      that.setState({
        developers: res.result.data
      }, ()=>{
        Taro.pageScrollTo({
          scrollTop: 0
        })
        if (current === 1) {
          Taro.stopPullDownRefresh()
          Taro.hideLoading()
        }
      })
    }).catch(err => {
      Taro.hideLoading()
      Taro.stopPullDownRefresh()
    })
  }

  loadLanguages() {
    let that = this
    const db = wx.cloud.database()
    let openid = getGlobalData('openid')
    if (!openid) {
      openid = Taro.getStorageSync('openid')
    }
    db.collection('languages')
      .where({
        _openid: openid, // 当前用户 openid
      })
      .get()
      .then(res => {
        console.log(res)
        if (res.data.length > 0) {
          setGlobalData('favoriteLanguages', res.data[0].languages)
          that.updateLanguages()
        }
      })
      .catch(err => {
        console.error(err)
      })
  }

  loadNotice() {
    let that = this
    const db = wx.cloud.database();
    db.collection('notices')
      .get()
      .then(res => {
        let noticeData = new Array();
        noticeData.push({"notice_id":"1111", "content":"更新提示: 2019-03-11日有更新, 2019-03-11日有更新, 2019-03-11日有更新, 2019-03-11日有更新", "status":true});
        res.data = noticeData;

        console.log('notices', res)
        if (res.data.length > 0) {
          const key = 'notice_key_' + res.data[0].notice_id
          const notice_closed = Taro.getStorageSync(key)
          that.setState({
            notice: res.data[0],
            notice_closed: notice_closed
          })
        }
      })
      .catch(err => {
        console.error(err)
      })
  }

  updateLanguages() {
    let favoriteLanguages = getGlobalData('favoriteLanguages')
    if (favoriteLanguages && favoriteLanguages.length > 0) {
      let language = favoriteLanguages[0]
      if (language.name !== 'All') {
        favoriteLanguages.unshift({
          "urlParam": "",
          "name": "All"
        })
      }
      this.setState({
        range: [
          [{'name': 'Today',
            'value': 'daily'},
            {'name': 'Week',
              'value': 'weekly'},
            {'name': 'Month',
              'value': 'monthly'}],
          favoriteLanguages
        ]
      })
    } else {
      this.setState({
        range: [
          [{'name': 'Today',
            'value': 'daily'},
            {'name': 'Week',
              'value': 'weekly'},
            {'name': 'Month',
              'value': 'monthly'}],
          languages
        ]
      })
    }
  }

  onTabChange(index) {
    //console.log("index:", index);
    this.setState({
      current: index
    })
  }

  onShareAppMessage(obj) {
    return {
      title: 'Github 今日热榜，随时随地发现您喜欢的开源项目',
      path: '/pages/index/index',
      imageUrl: 'http://img.huangjianke.com/cover.png'
    }
  }

  onCloseNotice() {
    const { notice } = this.state
    const key = 'notice_key_' + notice.notice_id
    Taro.setStorageSync(key, true)
  }

  render () {
    let categoryType = 0
    let categoryValue = this.state.category.value
    if (categoryValue === 'weekly') {
      categoryType = 1
    } else if (categoryValue === 'monthly') {
      categoryType = 2
    }
    const { developers, repos, current, notice, fixed, notice_closed, articles } = this.state
    return (
      <View className='content'>
        <View className={fixed ? 'segment-fixed' : ''}>
          <Segment tabList={['HOME', 'INTER', 'REPO', 'USER']} showAction={true} 
                   current={current}
                   onTabChange={this.onTabChange}
          />
        </View>
        {
          fixed &&
          <View className='segment-placeholder' />
        }
        {
          (notice.status && !notice_closed) &&
          <AtNoticebar icon='volume-plus' 
                       close 
                       //marquee 
                       //speed={50} 
                       single={true} 
                       showMore={true} 
                       moreText={"More"} 
                       onClose={this.onCloseNotice.bind(this)}>
            {notice.content}
          </AtNoticebar>
        }
        {
          current === 0 &&
          (repos.length > 0 ? <DashboardHome /> : <Empty />)
        }
        {
          current === 1 &&
          (repos.length > 0 ? <ArticleList itemList={repos} categoryType={categoryType} />:<Empty />)
        }
        {
          current === 2 &&
          (repos.length > 0 ? <ItemList itemList={repos} type={0} categoryType={categoryType} /> : <Empty />)
        }
        {
          current === 3 &&
          (developers.length > 0 ? <ItemList itemList={developers} type={1} categoryType={categoryType} /> : <Empty />)
        }

        {
          (this.state.range[1].length > 0 && current > 0) &&
          <View>
            <Picker mode='multiSelector'
                    range={this.state.range}
                    rangeKey={'name'}
                    onChange={this.onChange}
            >
              <View className='filter' animation={this.state.animation}>
                <Text className='category'>{this.state.category.name}</Text>
                &
                <Text className='language'>{this.state.language.name}</Text>
              </View>
            </Picker>
          </View>
        } 
      </View>
    )
  }
}

export default Index
