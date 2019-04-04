import { Component } from '@tarojs/taro'
import PropTypes from 'prop-types';
import { View } from '@tarojs/components'

import ArticleItem from '../interview/articleItem'

export default class ArticleList extends Component {

    static propTypes = {
      itemList: PropTypes.array,
      categoryType: PropTypes.number
    }
  
    static defaultProps = {
      categoryType: 0,
      itemList: []
    } 
  
    componentWillMount() {
    }

    handleClicked(item) {
        console.log("点击: ", item);
    }

    render() {
        const { itemList, categoryType } = this.props
        let list
        console.log("itemList: ", itemList);
        if(itemList != null && itemList.length > 0) {
          list = itemList.map((item, index) => {
            return (
              <View key={index} onClick={this.handleRepoClicked.bind(this, item)}>
                <ArticleItem item={item} categoryType={categoryType} />
              </View>
            )
          })
        }

        return (
            <View>
              {
                list
              }
            </View>
        )
    }


}