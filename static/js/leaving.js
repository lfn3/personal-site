var React = React || null // Supress std js error messages

var introStates = {
  start: {
    content: function () {
      return React.createElement('p', {}, 'And you have to write a farewell email.')
    },
    currentOptions: function () {
      return [
        { name: 'Start writing the email', nextState: introStates.startedWriting },
        { name: 'Procrastinate for a while', nextState: introStates.procrastinating }
      ]
    }
  },
  startedWriting: {
    content: function () {
      return React.createElement('p', {}, '"Ettique" dictates you should start with some kind of saluation.')
    },
    currentOptions: function () {
      return introOptions
    }
  },
  rudeIntro: {
    content: function () {
      return React.createElement('div', {}, [
        React.createElement('blockquote', {}, 'Hello, you band of unmitigated savages,'),
        React.createElement('p', {}, 'This may have crossed some kind of line somewhere, but it has a veneer of civility. Especially since you managed to avoid saying fuck. Success!')
      ])
    },
    currentOptions: function () {
      return introParaOptions
    }
  },
  funnyIntro: {
    content: function () {
      return React.createElement('div', {}, [
        React.createElement('blockquote', {}, 'Привет товарищ'),
        React.createElement('p', {}, 'Russian is funny, right?'),
        React.createElement('p', {}, 'Better check with a Vlad later...')
      ])
    }
  },
  normalishIntro: {
    content: function () {
      return React.createElement('div', {}, [
        React.createElement('blockquote', {}, 'Greetins to you my friend'),
        React.createElement('blockquote', {}, 'I know this email will come as a surprise to you, but I am in fact a nigerian prince, imprisioned in my own country.'),
        React.createElement('p', {}, 'You\'ve seen this intro thousands of times, it\'s gotta be the best one')
      ])
    },
    currentOptions: function () {
      return introParaOptions
    }
  },
  normalIntro: {
    content: function () {
      return React.createElement('p', {}, 'Oh come on, do you think I was going to let you get out that easily?')
    },
    currentOptions: function () {
      return introOptions.slice(0, 3)
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
        { name: 'Start writing the email', nextState: introStates.startedWriting },
        { name: 'Procrastinate some more', nextState: introStates.continuedProcrastinating }
      ]
    }
  },
  continuedProcrastinating: {
    content: function () {
      return React.createElement('p', {}, 'You haven\'t checked facebook in a while... After scrolling through 6 months of news feed, you feel slightly more autistic.')
    },
    updateState: function (currentState) {
      currentState.autism = true
      return currentState
    },
    currentOptions: function () {
      return [
        { name: 'Start writing the email already', nextState: introStates.startedWriting },
        { name: 'Procrastinate even more', nextState: introStates.evenMoreProcrastinating }
      ]
    }
  },
  evenMoreProcrastinating: {
    content: function () {
      return React.createElement('img', { src: 'http://i.imgur.com/ocqq7.gif' })
    },
    currentOptions: function () {
      return [
        { name: 'Start writing the email already', nextState: introStates.startedWriting },
        { name: 'Procrastinate more than you thought possible', nextState: introStates.maximumProcrastination }
      ]
    }
  },
  maximumProcrastination: {
    content: function () {
      return React.createElement('p', {}, 'You decide it would be a way better idea to write some sort of web application to do this instead of just writing an email. Unfortunately then the fourth wall opens, and you talk yourself out of it.')
    },
    currentOptions: function () {
      return [
        { name: 'Start writing the damn email already', nextState: introStates.startedWriting }
      ]
    }
  }

  /* inOutlook: {
    content: 'You open Outlook. You have 5435 emails. Someone has posted your email address on Craigslist solicting "An all night bukkake session". You blame Ben.'
  } */
}

var introOptions = [
  { name: 'Act rude', nextState: introStates.rudeIntro },
  { name: 'Try to be funny', nextState: introStates.funnyIntro },
  { name: 'Attempt to behave normally', nextState: introStates.normalishIntro },
  { name: 'Actually behave normally', nextState: introStates.normalIntro }
]

var paraStates = {
  joke: {

  },
  ranting: {
    content: function () {
      return React.createElement('p', {}, '')
    }
  }
}

var introParaOptions = [
  { name: 'Try to warm them up with a joke', nextState: paraStates.joke },
  { name: 'Go straight for the feels', nextState: paraStates.feels }

]

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
        optionHandler(current, val)
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
      current: introStates.start,
      history: [
      ],
      karma: Math.round(Math.random() * 400 + 80)
    }
  },
  optionHandler: function (current, clickedOption) {
    var next = clickedOption.nextState

    if (next.updateState) {
      var nextState = next.updateState(this.state)
      this.setState(nextState)
    }

    var nextHistory = this.state.history

    nextHistory.push(current)
    nextHistory.push({ content: function () {
      return React.createElement('p', { className: 'selectedOption' }, clickedOption.name)
    }})

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
