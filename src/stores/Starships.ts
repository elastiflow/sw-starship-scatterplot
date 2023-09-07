import { makeObservable, toJS, action, observable, computed } from 'mobx';

export type Starship = {
    name: string;
    crew: string;
    passengers: string;
    length: string;
    url: string;
    films: string[];
};

class Starships {
    url = 'https://swapi.dev/api/starships/';

    loading = false;

    data: Starship[] = [];

    selectedFilms: string[] = [];

    constructor() {
        makeObservable(this, {
            loading: observable,
            data: observable,
            selectedFilms: observable,
            filteredData: computed,
            addFilter: action,
            removeFilter: action,
            setData: action,
            fetch: action
        });
    }

    get filteredData() {
        const jsData = toJS(this.data);
        const selected = toJS(this.selectedFilms);

        if (jsData.length === 0 || selected.length === 0) {
            return jsData;
        }
        
        return jsData.filter(
            (s: Starship) => selected.some(
                (url: string) => {
                    /**
                     * NOTE TO PEOPLE OF THE FUTURE!
                     * 
                     * SWAPI has a bug, where the /films/ API reports one set of values for "starships" in that film,
                     * but the /starships/ API reports a different set of "films" the ship appears in.
                     * 
                     * Clearly one of the two APIs is incomplete/incorrect...
                     * If you think you're seeing the wrong list of starships in the D3 graph, that's why!
                     */
                    const starshipInFilm = s.films.includes(url)

                    return starshipInFilm;
                }
            )
        );
    }

    addFilter = (url: string) => {
        this.selectedFilms.push(url);
    }

    removeFilter = (url: string) => {
        // @ts-ignore because this.data is a mobx observable, not an actual array
        this.selectedFilms.remove(url);
    }

    setData = (data: Starship[] = []) => {
        // @ts-ignore because this.data is a mobx observable, not an actual array
        this.data.replace(data);
    }

    fetch = () => {
        this.loading = true;

        let promiseChain;

        try {
            const newData: Starship[] = [];
            promiseChain = fetch(`${this.url}`);
            
            promiseChain
                .then(response => response.json())
                // SWAPI only returns 10 items per page, so we must recursively call the API to retreive all possible values
                .then(raw => {
                    newData.push(...raw.results);

                    // exclude the first request
                    const numberOfPagesLeft = Math.ceil((raw.count - 1) / 10);

                    let promises = [];
                    for (let i = 2; i <= numberOfPagesLeft; i++) {
                        promises.push(
                            fetch(`${this.url}?page=${i}`)
                                .then(response => response.json())
                        );
                    }
                    return Promise.all(promises);
                })
                .then(response => {
                    //add the rest of the records, pages 2 through n.
                    response.forEach((raw) => {
                        newData.push(...raw.results);
                    });

                    this.setData(newData);
                    this.loading = false;
                });
        }
        catch (e) {
            // error handling would go here
            promiseChain = Promise.resolve();
            this.loading = false;
        }

        // allow chained reactions in consuming code
        return promiseChain;
    }
}

const StarshipsStore = new Starships();

export default StarshipsStore;