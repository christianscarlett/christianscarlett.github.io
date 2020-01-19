import React from 'react';
import './App.css';
import two from './assets/cards/2C.png';

class Card extends React.Component {
  constructor(props) {
    super(props);
    this.value = props.value;
  }

  render() {
    return (
      <div class='card'>
        <img src={require('./assets/cards/' + this.value + '.png')} />
      </div>
    );
  }
}

class Deck extends React.Component {
  constructor(props) {
    super(props);
    this.refreshDeck();
    this.state = {
      empty: false,
    };
  }

  refreshDeck() {
    this.cards = [];
    ["C", "D", "H", "S"].forEach(suit => {
      ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].forEach(value => {
        this.cards.push(value+suit);
      });
    });
  }

  shuffle() {
    var j, x, i;
    for (i = this.cards.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = this.cards[i];
        this.cards[i] = this.cards[j];
        this.cards[j] = x;
    }
  }

  draw() {
    return this.cards.pop();
  }

  render() {
    return (
      <div class='deck'>
        <img src={require('./assets/cards/gray_back.png')} />
      </div>
    );
  }
}

class Hand extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: ['2C', '3H'],
    };
  }

  render() {
    const cards = [];
    this.state.cards.forEach(card => {
      cards.push(<Card value={card} />);
    });
    return (
      <div class='hand'>
        {cards}
      </div>
    );
  }
}

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hand: new Hand(),
    };
  }

  render() {
    return (
      <Hand />
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.deck = new Deck();
    this.player1 = new Player();
    this.player2 = new Player();
    this.state = {
      completed: false,
    };
  }

  render(){
    return (
      <div class='board'>
        {this.player1.render()}
        {this.deck.render()}
        {this.player2.render()}
      </div>
    );
  }
}

function App() {
  return (
    <Game />
  );
}

export default App;
