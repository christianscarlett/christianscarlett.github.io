import React from 'react';
import './App.css';


const CARDS_URL = './assets/cards/';



class Card extends React.Component {
  constructor(props) {
    super(props);
    this.value = props.value;
  }

  render() {
    return (
      // KEEP CLASS this.value OR ELSE CARD RERENDERING WILL NOT WORK !!!
      <div class={'card ' + this.value}>
        <input class='cardimage' type='image' src={require(CARDS_URL + this.value + '.png')} onClick={this.props.onClick} 
        disabled={this.props.disabled} />
      </div>
    );
  }
}



class Deck extends React.Component {
  constructor(props) {
    super(props);
    this.refreshDeck();
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
    let card = this.cards.pop();
    return card;
  }

  render() {
    let back = 'green_back';
    if (this.props.empty) back = 'gray_back';

    return (
      <div class='deck'>
        <input class='cardimage' type='image' src={require(CARDS_URL+back+'.png')} onClick={this.props.empty ? '' : this.props.onClick} />
      </div>
    );
  }
}



class Hand extends React.Component {
  constructor(props) {
    super(props);
    this.deck = props.deck
    this.props.attachHand(this);
    this.pairs = 0;
    this.isAI = props.ai;
    this.state = {
      cards: Array(7).fill().map(el => this.deck.draw()),
      matching: this.props.movesFirst
    };
  }

  removeIndex(ix, array) {
    return array.slice(0, ix).concat(array.slice(ix+1));
  }

  spliceCard(ix) {
    let cards_ = this.removeIndex(ix, this.state.cards);
    this.setState({
      cards: cards_
    });
    return cards_;
  }

  removeIndices(ix1, ix2, array) {
    let firstIx = Math.min(ix1, ix2);
    let secondIx = Math.max(ix1, ix2);
    return array.slice(0, firstIx).concat(array.slice(firstIx+1, secondIx)).concat(array.slice(secondIx+1));
  }

  spliceCards(ix1, ix2) {
    let cards_ = this.removeIndices(ix1, ix2, this.state.cards);
    this.setState({
      cards: cards_
    });
    return cards_;
  }

  drawFromDeck() {
    let cards_ = this.state.cards.slice();
    cards_.push(this.props.deck.draw());
    this.setState({
      cards: cards_
    });
  }

  render() {
    let can_fish = this.props.isTurn ? '' : 'disabled';

    return (
      <div class='hand'>
        <p>Pairs: {this.pairs}</p>
        {this.state.cards.map(card => <Card value={card} disabled={this.state.matching ? '' : 'disabled'} 
        onClick={() => this.props.cardFunc(card)} key={card} />)}
      </div>
    );
  }
}



class Player extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let isTurn = (this.props.turn === this.props.player);
    return (
      <div>
        <Hand deck={this.props.deck} isTurn={isTurn} onDrawFunc={this.props.onDrawFunc} ai={this.props.ai} 
        attachHand={this.props.attachHand} cardFunc={this.props.cardFunc} movesFirst={this.props.player === 0} />
      </div>
    );
  }
}



class Game extends React.Component {
  constructor(props) {
    super(props);
    this.deck = new Deck();
    this.deck.shuffle();
    this.hands = Array(2).fill(null);
    this.state = {
      winner: null,
      turn: 0,
    };
  }

  attachHand(ix, hand) {
    this.hands[ix] = hand;
  }

  changeTurn() {
    this.hands[this.state.turn].setState({matching: false});

    this.hands[this.state.turn].drawFromDeck();

    let newTurn = (this.state.turn + 1) % 2;
    let newHand = this.hands[newTurn];
    this.setState({turn: newTurn});
    newHand.setState({matching: true});
  }

  calcWin(hand1, hand2) {
    console.log('calcing win');
    let winner = null;
    if ((!hand1.length) || (!hand2.length)) {
      if (this.hands[0].pairs === this.hands[1].pairs) {
        winner = 'tie';
      } else if (this.hands[0].pairs > this.hands[1].pairs) {
        winner = 'Player';
      } else {
        winner = 'AI';
      }
    }
    this.setState({winner: winner});
  }

  checkPair(player, card) {
    let thisHand = this.hands[player];
    let cardix = thisHand.state.cards.indexOf(card);
    let otherHand = this.hands[(player + 1) % 2];
    let otherHandCards = otherHand.state.cards.map(el => el.slice(0, -1));

    let hand1 = thisHand.state.cards;
    let hand2 = otherHand.state.cards;

    // Pairs in own hand
    let otherCardix = null;
    thisHand.state.cards.forEach(otherCard => {
      if ((otherCard.slice(0, -1) === card.slice(0, -1)) && (otherCard !== card)) {
        otherCardix = thisHand.state.cards.indexOf(otherCard);
      }
    });
    if (otherCardix !== null) {
      console.log('pair in hand');
      hand1 = thisHand.spliceCards(cardix, otherCardix);
      thisHand.pairs += 1;
      this.calcWin(hand1, hand2);
      console.log(card, thisHand.state.cards[otherCardix]);
      return ;
    }

    // Pairs in other hand
    if (otherHandCards.includes(card.slice(0, -1))) { 
      console.log('pair in other hand');
      cardix = thisHand.state.cards.indexOf(card);
      hand1 = thisHand.spliceCard(cardix);
      cardix = otherHandCards.indexOf(card.slice(0, -1));
      hand2 = otherHand.spliceCard(cardix);
      thisHand.pairs += 1;
      this.calcWin(hand1, hand2);
      console.log(card, otherHand.state.cards[cardix]);
      return ;
    }

    thisHand.setState({
      matching: false
    });

  }

  render() {
    return (
      <div class='board'>
        <Player deck={this.deck} player={1} turn={this.state.turn} attachHand={(hand) => this.attachHand(1, hand)} 
        cardFunc={(card) => this.checkPair(1, card)} ai={true}/>
        <Deck onClick={() => this.changeTurn()} empty={!this.deck.cards.length} />
        <p>Turn: {this.state.turn ? "AI" : "Player"}</p>
        <p>Winner: {this.state.winner ? this.state.winner : "None"}</p>
        <Player deck={this.deck} player={0} turn={this.state.turn} attachHand={(hand) => this.attachHand(0, hand)} 
        cardFunc={(card) => this.checkPair(0, card)} ai={false}/>
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
