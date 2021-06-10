import React, { Component } from 'react'
import axios from 'axios'
import './myStyles.css'

class PostList extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
            posts: [],
            errorMessage: ''     
        }
        this.setValues = this.setValues.bind(this)
        this.setPercentatgeColor = this.setPercentatgeColor.bind(this)
        this.setFieldColor = this.setFieldColor.bind(this)
    }

    setPercentatgeColor(value){
        if( parseFloat(value) < 0) {
            return <td className='menor'>{value}</td>
        }else if( parseFloat(value) >= 0){
            return <td className='major'>{value}</td>
        }
    }

    setFieldColor(post){
        if( parseFloat(post.priceChangePercent) < 0) {
            return 'menorHover'
        }else if( parseFloat(post.priceChangePercent) >= 0){
            return 'majorHover'
        }
    }

    setValues(){
        axios.get('https://api.binance.com/api/v1/ticker/24hr')   
        .then(response => {
            console.log(response)
            this.setState({posts: response.data})
        }) 
        .catch(error => {
            console.log(error)
            this.setStar({errorMessage: 'Error retriving data'})
        })
    }

    componentDidMount(){
        this.setValues()
        setInterval(() => {            
            axios.get('https://api.binance.com/api/v1/ticker/24hr')   
            .then(response => {
                console.log(response)
                this.setState({posts: response.data})
            }) 
            .catch(error => {
                console.log(error)
                this.setStar({errorMessage: 'Error retriving data'})
            })
        }, 30000)
    }

    render() {
        const { posts, errorMessage } = this.state
        return (                       
            <table >
                <thead>                        
                    <tr>
                        <th>Nom</th>
                        <th>Percentatge</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.length ? 
                        posts.map(post => <tr className={this.setFieldColor(post)} key={post.symbol}>
                        <td>{post.symbol}</td>
                        {this.setPercentatgeColor(post.priceChangePercent)}
                        <td>{post.lastPrice}</td>
                        </tr>) 
                    : null}
                    {errorMessage ? <tr>{errorMessage}</tr> : null}
                </tbody>    
            </table>               
        )
    }
}

export default PostList
