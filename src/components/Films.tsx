import React from 'react';
import { observer, inject } from 'mobx-react';

import { Film } from '../stores/Films';

import './Films.css';

type FilmsProps = {
    Films?: any;
    Starships?: any;
}

class Films extends React.Component<FilmsProps, null> {
    componentDidMount() {
        const { Films } = this.props;

        Films.fetch();
    }

    onCheckHandler = (e: any) => {
        const { Starships } = this.props;
        const { checked, value } = e.target;
        
        if (checked) {
            Starships.addFilter(value);
        } else {
            Starships.removeFilter(value);
        }
    }

    renderFilmOptions = () => {
        const { Films } = this.props;
        
        const options: any[] = [];

        for (let i=0; i<Films.data.length; i++) {
            const film: Film = Films.data[i];

            options.push(
                <div key={film.episode_id} className="filmFilter">
                    <input
                        type="checkbox"
                        onChange={this.onCheckHandler}
                        value={`${Films.url}/${film.episode_id}/`}
                    />&nbsp;{film.title}
                </div>
            );
        }

        return options;
    }
    
    render() {
        const { Films } = this.props;

        return (
            <div className="Films">
                <h2>Star Wars Films</h2>

                {Films.loading && <p>Loading...</p>}

                {!Films.loading && this.renderFilmOptions()}
            </div>
        );
    }
}

// @ts-ignore because TypeScript has a hard time understanding the mobx wrapper
export default inject('Films', 'Starships')(observer(Films));