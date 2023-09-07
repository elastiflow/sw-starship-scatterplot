import { makeAutoObservable } from 'mobx';

export type Film = {
    episode_id: number;
    title: string;
    release_date: string;
};

class Films {
    url = 'https://swapi.dev/api/films';

    loading = false;

    data: Film[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    setData = (data: Film[] = []) => {
        // @ts-ignore because this.data is a mobx observable, not an actual array
        this.data.replace(data);
    }

    fetch = () => {
        this.loading = true;

        let promiseChain;

        try {
            promiseChain = fetch(this.url);
            
            promiseChain.then(response => {
                return response.json();
            }).then(raw => {
                this.setData(raw.results);
                this.loading = false;
            });
        }
        catch (e) {
            // error handling?
            promiseChain = Promise.resolve();
            this.loading = false;
        }

        // allow chained reactions in consuming code
        return promiseChain;
    }
}

const FilmsStore = new Films();

export default FilmsStore;