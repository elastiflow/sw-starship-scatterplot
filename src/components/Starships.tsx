import React from 'react';
import { observer, inject } from 'mobx-react';

import ScatterPlot from './ScatterPlot';

import './Starships.css';

type StarshipsProps = {
    Starships?: any;
}

class Starships extends React.Component<StarshipsProps, null> {
    componentDidMount() {
        const { Starships } = this.props;

        Starships.fetch();
    }

    render() {
        const { Starships } = this.props;

        return (
            <div className="Starships">
                {Starships.loading && <p>Loading...</p>}

                {!Starships.loading && <ScatterPlot data={Starships.filteredData} />}
            </div>
        );
    }
}

// @ts-ignore because TypeScript has a hard time understanding the mobx wrapper
export default inject('Starships')(observer(Starships));