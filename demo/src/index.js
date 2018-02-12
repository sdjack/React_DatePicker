import React, {Component} from 'react'
import {render} from 'react-dom'

import Example from '../../src/index.js'
import '../../src/style.css'

class Demo extends Component {
  render() {
    return <div style={{width: '100%'}}>
      <h1>React_DatePicker Demo</h1>
      <div><Example id="demo_dp"/></div>
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
