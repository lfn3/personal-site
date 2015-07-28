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
    },
    updateState: function (currentState) {
      currentState.russian = true
      return currentState
    },
    currentOptions: function () {
      return introParaOptions
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
      return React.createElement('p', {}, 'You haven\'t checked facebook in a while... After scrolling through 6 months of news feed, you feel slightly more loathing torwards everything around you.')
    },
    updateState: function (currentState) {
      currentState.loathing = true
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

var introParaStates = {
  joke: {
    content: function () {
      return React.createElement('div', {}, [
        React.createElement('p', {}, 'You decide the best possible approach is to channel the ghost of Nico\'s past, and write something "punny"'),
        React.createElement('blockquote', {}, 'I\'d tell you I had an average time here, but that would just be mean.'),
        React.createElement('p', {}, 'Reading over your masterwork of humor makes you feel terrible, so you know it\'s totally on point')
      ])
    },
    currentOptions: function () {
      return [
        { name: 'Try and soothe this awful feeling with a bear', nextState: introParaStates.morePuns },
        { name: 'MOAR PUNS', nextState: introParaStates.morePuns }
      ]
    }
  },
  morePuns: {
    content: function () {
      return React.createElement('div', {}, [
        React.createElement('img', { src: 'http://40.media.tumblr.com/tumblr_mb720wBOiQ1ql2603o1_500.jpg'})
      ])
    },
    currentOptions: function () {
      return [
        { name: 'Try and soothe this awful feeling with a beer', nextState: introParaStates.punnyBeer },
        { name: 'Follow up on the puns with some actual words', nextState: bodyParaStates.start }
      ]
    }
  },
  feels: {
    content: function () {
      return React.createElement('div', {}, [
        React.createElement('p', {}, 'The best way to convince everyone you\'re not some kind of code robot fueled by beer and coffee is to express some sort of emotion in words'),
        React.createElement('blockquote', {}, 'Well, first of all, I\'d like to thank all of you. It\'s been a real pleasure working with each an everyone of you, especially since by and large you\'ve shown yourselves to be smarter than the clients.'),
        React.createElement('p', {}, 'The witty bit about the clients is a really nice touch. You high five yourself in your brain.')
      ])
    },
    currentOptions: function () {
      return [
        { name: 'All these emotions are overwhelming you. Try and sooth your feelings with a beer', nextState: introParaStates.sadBeer }
      ]
    }
  },
  beer: {
    content: function () {
      return React.createElement('p', {}, 'You decide it\'s time to reward all your hard work with a delicious cold adult beverage.')
    },
    updateState: function (currentState) {
      currentState.beers++
      return currentState
    },
    currentOptions: function () {
      return introParaOptions.slice(0, 2)
    }
  },
  punnyBeer: {
    content: function () {
      return React.createElement('div', {}, [
        React.createElement('p', {}, 'You open the fridge and collect a bear. Unfortunately, when you attempt to open it, it violently objects and mauls you to death. Worst last day ever.')
      ])
    },
    updateState: summarize,
    currentOptions: function () {
      return []
    }
  }
}

var introParaOptions = [
  { name: 'Try to warm them up with a joke', nextState: introParaStates.joke },
  { name: 'Go straight for the feels', nextState: introParaStates.feels },
  { name: 'Reward all your hard work with a beer', nextState: introParaStates.beer }
]

var bodyParaStates = {
  start: {
    content: function () {
      return React.createElement('p', {}, 'Time to spill some serious ink. You rack your brains trying to think of ways to use your words...')
    },
    currentOptions: function () {
      return [
        { name: 'Attempt to convey that you learnt well good in your time here', nextState: bodyParaStates.learnt },
        { name: 'Deploy a tactical cat picture', nextState: bodyParaStates.catPic },
        { name: 'Offer a guest dog power ranking', nextState: bodyParaStates.dogRating },
        { name: 'Drop some beats', nextState: bodyParaStates.bassDrop },
        { name: 'Comment on the sick levels of humor', nextState: bodyParaStates.humor}
      ]
    }
  },
  humor: {

  },
  learnt: {
    content: function () {
      return React.createElement('blockquote', {}, 'I\'ve managed to pick a lot in my time here, so thanks for giving me the chance to do that. Some of it two or three times, even. Hopefully I never have to learn how code emails ever again. It\'s been nice working with some more or less sane developers for a while. Hopefully at the next gig they\'re as on point as they seem.')
    },
    currentOptions: function () {
      return [
        { name: 'Deploy a tactical cat picture', nextState: bodyParaStates.catPic },
        { name: 'Offer a guest dog power ranking', nextState: bodyParaStates.dogRating }
      ]
    }
  },
  dogRating: {
    content: function () {
      return React.createElement('blockquote', {}, [
          'I think it\'s super important that you all know which dog is the best dog.',
          React.createElement('ol', {}, [
            React.createElement('li', {}, 'Steve (Points for having a people name, and scaring the courier that one time)'),
            React.createElement('li', {}, 'Spirit (Mad props for annoying Ben)'),
            React.createElement('li', {}, 'Fliss (SO MUCH FLUFFY)'),
            React.createElement('li', {}, 'Molly (Cuter than Leela. Probably because she\'s smaller)'),
            React.createElement('li', {}, 'Leela (See above)'),
            React.createElement('li', {}, 'Nacho (Bitey)')
          ]),
          'Incidentally, I think they\'re ordered by size. Or close to it. Totally nothing to do with me not being a fan of handbag dogs.'
        ])
    },
    currentOptions: function () {
      return [
        { name: 'Attempt to convey that you learnt well good in your time here', nextState: bodyParaStates.learnt },
        { name: 'Deploy a tactical cat picture', nextState: bodyParaStates.catPic },
        { name: 'Offer a guest dog power ranking', nextState: bodyParaStates.dogRating },
        { name: 'Drop some beats', nextState: bodyParaStates.bassDrop }
      ]
    }
  },
  bassDrop: {
    content: function () {
      return React.createElement('div', {}, [
        React.createElement('p', {}, 'You\'re really impressed that you managed to find a way to jam audio in an "Email".'),
        React.createElement('iframe', { width: '100%', height: '450', scrolling: 'no', frameborder: 'no', src: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/45959360&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true'})
      ])
    },
    currentOptions: function () {
      return [
        { name: 'Attempt to convey that you learnt well good in your time here', nextState: bodyParaStates.learnt }
      ]
    }
  },
  catPic: {
    content: function () {
      return React.createElement('img', { src: 'http://i.imgur.com/8ByaI.gif' })
    },
    currentOptions: function () {
      return [
        { name: 'Attempt to convey that you learnt well good in your time here', nextState: bodyParaStates.learnt }
      ]
    }
  },
  ranting: {
    content: function () {
      return React.createElement('p', {}, '')
    }
  }
}

function summarize (currentState) {
  currentState.summary = true
  return currentState
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
        optionHandler(current, val)
      }
      return React.createElement('li', {}, [
        React.createElement('a', { onClick: clickHandler }, val.name)])
    })

    return React.createElement('ul', {}, children)
  }
})

var summary = React.createClass({
  render: function () {
    var children = []

    children.push(React.createElement('h1', {}, 'GAME OVER'))

    if (this.props.completedEmail === true) {
      children.push(React.createElement('img', { src: 'http://i.imgur.com/uLj0u.gif' }))
      children.push(React.createElement('p', {}, 'Against all odds, you managed to finish the email. Your colleagues will be forever thankful for your wisdom.'))
    } else {
      children.push(React.createElement('img', { src: 'http://i.imgur.com/Gn04H.gif' }))
      children.push(React.createElement('p', {}, 'You failed in your god given task of sending a farewell email. Your legacy is destined to be forgotten.'))
    }

    if (this.props.beers > 0) {
      children.push(React.createElement('p', {}, 'You successfully consumed ' + this.props.beers + ' beers'))
    }

    if (this.props.russian === true) {
      children.push(React.createElement('p', {}, 'You managed to "master" the Russian language'))
    }

    if (this.props.autism === true) {
      children.push(React.createElement('p', {}, 'You somehow managed to contract autism. You suspect the air conditioning is somehow involved'))
    }

    return React.createElement('div', { className: 'summary' }, children)
  }
})

var app = React.createClass({
  getInitialState: function () {
    return {
      current: introStates.start,
      history: [
      ],
      karma: Math.round(Math.random() * 400 + 80),
      russian: false,
      loathing: false,
      beers: 0,
      summary: false,
      completedEmail: false,
      autism: false
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
    if (this.state.summary === false) {
      children.push(React.createElement(options, state))
    }

    var css = {}

    if (this.state.beers > 0) {
      css.color = 'transparent'
      css.textShadow = '0 0 ' + this.state.beers + 'px rgba(0, 0, 0, 0.75)'
    }

    if (this.state.summary === true) {
      children.push(React.createElement(summary, this.state))
    }

    return React.createElement('div', { style: css }, children)
  }
})

React.render(React.createElement(app), document.getElementById('mount'))
