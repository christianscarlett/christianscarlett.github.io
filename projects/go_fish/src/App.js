import React from 'react';
import './App.css';
// import two from './assets/cards/2C.png';

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
      shuffled: false,
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
    this.setState({
      shuffled: true
    });
  }

  draw() {
    let card = this.cards.pop();
    if (this.cards.length === 0) {
      this.setState({empty: true});
    }
    return card;
  }

  render() {
    let back = 'green_back';
    if (this.state.empty) back = 'gray_back';

    return (
      <div class='deck'>
        <img src={require('./assets/cards/'+back+'.png')} />
      </div>
    );
  }
}



class Hand extends React.Component {
  constructor(props) {
    super(props);
    this.deck = props.deck
    this.state = {
      cards:[]
    };
  }

  drawFromDeck() {
    let cards_ = this.state.cards.slice();
    cards_.push(this.props.deck.draw());
    this.setState({
      cards: cards_
    });
  }

  render() {
    const cards = [];
    this.state.cards.forEach(card => {
      cards.push(<Card value={card} />);
    });
    let can_fish = this.props.fish ? 'disabled' : '';

    return (
      <div class='hand'>
        <button onClick={() => this.drawFromDeck()} disabled={can_fish}>Go Fish</button>
        {cards}
      </div>
    );
  }
}



class Player extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let fish = (this.props.turn === this.props.player);

    return (
      <div>
        <Hand deck={this.props.deck} fish={fish} />
      </div>
    );
  }
}



class Game extends React.Component {
  constructor(props) {
    super(props);
    this.deck = new Deck();
    this.deck.shuffle();
    this.state = {
      completed: false,
      turn: 1,
    };
  }

  render(){
    return (
      <div class='board'>
        <Player deck={this.deck} player={1} turn={this.state.turn}/>
        <Deck state={this.deck.state} />
        <Player deck={this.deck} player={2} turn={this.state.turn}/>
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
