import React from 'react';
import { Provider } from 'mobx-react';

import FilmsStore from './stores/Films';
import StarshipsStore from './stores/Starships';

import Films from './components/Films';
import Starships from './components/Starships';

import './App.css';

function App() {
  return (
    <div className="App">
      <Provider Starships={StarshipsStore} Films={FilmsStore}>
        <div className="AppWrapper">
          <Films />
          <Starships />
        </div>
      </Provider>
    </div>
  );
}

export default App;
