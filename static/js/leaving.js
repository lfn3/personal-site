var React = React || null // Supress std js error messages

var possibleStates = {
  start: {
    content: function () {
      return React.createElement('p', {}, 'And you have to write a farewell email.')
    },
    currentOptions: function () {
      return [
        { name: 'Start writing the email', nextState: possibleStates.startedWriting },
        { name: 'Procrastinate for a while', nextState: possibleStates.procrastinating }
      ]
    }
  },
  startedWriting: {
    content: function () {
      return React.createElement('p', {}, 'You decide it\'s a way better use of your time to make some memes and try to post them on Reddit. After two hours, you have gained 4 karma.')
    },
    currentOptions: function () {
      return [
        { name: ''}
      ]
    }
  },
  procrastinating: {
    content: function () {
      return React.createElement('p', {}, 'You decide it\'s a way better use of your time to make some memes and try to post them on Reddit. After two hours, you have gained 4 karma.')
    },
    updateState: function (currentState) {
      currentState.karma = currentState.karma + 4
      return currentState
    },
    currentOptions: function () {
      return [
        { name: '', nextState: '' },
        { name: '', nextState: '' }
      ]
    }
  }
  /* inOutlook: {
    content: 'You open Outlook. You have 5435 emails. Someone has posted your email address on Craigslist solicting "An all night bukkake session". You blame Ben.'
  } */
}

var content = React.createClass({
  render: function () {
    var children = this.props.history.map(function (val) {
      return val.content(this.props)
    })

    children.push(this.props.current.content(this.props))

    return React.createElement('div', {}, children)
  }
})

var options = React.createClass({
  render: function () {
    var optionHandler = this.props.optionHandler
    var current = this.props.current
    var options = current.currentOptions(this.props)

    var children = options.map(function (val) {
      function clickHandler () {
        optionHandler(current, val.nextState)
      }
      return React.createElement('li', {}, [
        React.createElement('a', { onClick: clickHandler }, val.name)])
    })

    return React.createElement('ul', {}, children)
  }
})

var app = React.createClass({
  getInitialState: function () {
    return {
      current: possibleStates.start,
      history: [
      ],
      karma: Math.round(Math.random() * 400 + 80)
    }
  },
  optionHandler: function (current, next) {
    if (next.updateState) {
      var nextState = next.updateState(this.state)
      this.setState(nextState)
    }

    var nextHistory = this.state.history
    nextHistory.push(current)
    this.setState({history: nextHistory, current: next })
  },
  render: function () {
    var children = []

    var state = this.state
    state.optionHandler = this.optionHandler

    children.push(React.createElement(content, this.state))
    children.push(React.createElement(options, state))

    return React.createElement('div', {}, children)
  }
})

React.render(React.createElement(app), document.getElementById('mount'))
