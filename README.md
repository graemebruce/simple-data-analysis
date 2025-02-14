# Simple data analysis (SDA) in JavaScript

This repository is maintained by [Nael Shiab](http://naelshiab.com/), computational journalist and senior data producer for [CBC News](https://www.cbc.ca/news).

To install with NPM:

```
npm i simple-data-analysis
```

The documentation is available [here](https://nshiab.github.io/simple-data-analysis/).

## Core principles

These project's goals are:

-   To offer a high-performance and convenient solution in JavaScript for data analysis. It's based on [DuckDB](https://duckdb.org/) and inspired by [Pandas](https://github.com/pandas-dev/pandas) (Python) and the [Tidyverse](https://www.tidyverse.org/) (R).

-   To standardize and accelerate frontend/backend workflows with a simple-to-use library working both in the browser and with NodeJS (and similar runtimes).

-   To ease the way for non-coders (especially journalists and web developers) into the beautiful world of data analysis and data visualization in JavaScript.

SDA is based on [duckdb-node](https://github.com/duckdb/duckdb-node) and [duckdb-wasm](https://github.com/duckdb/duckdb-wasm). DuckDB is a high-performance analytical database system. Under the hood, SDA sends SQL queries to be executed by DuckDB.

You also have the flexibility of writing your own queries if you want to (check the [customQuery method](https://nshiab.github.io/simple-data-analysis/classes/SimpleDB.html#customQuery)) or to use JavaScript to process your data (check the [updateWithJS method](https://nshiab.github.io/simple-data-analysis/classes/SimpleDB.html#updateWithJS)).

Feel free to start a conversation or open an issue. Check how you can [contribute](https://github.com/nshiab/simple-data-analysis/blob/main/CONTRIBUTING.md).

## About v2

Because v1.x.x versions weren't based on DuckDB, v2.0.1 is a complete rewrite of the library with many breaking changes.

To test and compare the performance of **simple-data-analysis@2.0.1**, we calculated the average temperature per decade and city with the daily temperatures from the [Adjusted and Homogenized Canadian Climate Data](https://api.weather.gc.ca/collections/ahccd-annual). See [this repository](https://github.com/nshiab/simple-data-analysis-benchmarks) for the code.

We ran the same calculations with **simple-data-analysis@1.8.1** (both NodeJS and Bun), **Pandas** (Python), and the **Tidyverse** (R).

In each script, we:

1. Loaded a CSV file (_Importing_)
2. Selected four columns, removed rows with missing temperature, converted date strings to date and temperature strings to float (_Cleaning_)
3. Added a new column _decade_ and calculated the decade (_Modifying_)
4. Calculated the average temperature per decade and city (_Summarizing_)
5. Wrote the cleaned-up data that we computed the averages from in a new CSV file (_Writing_)

Each script has been run ten times on a MacBook Pro (Apple M1 Pro / 16 GB), and the durations have been averaged.

The charts displayed below come from this [Observable notebook](https://observablehq.com/@nshiab/simple-data-analysis-benchmarks).

### Small file

With _ahccd-samples.csv_:

-   74.7 MB
-   19 cities
-   20 columns
-   971,804 rows
-   19,436,080 data points

As we can see, **simple-data-analysis@1.8.1** was the slowest, but **simple-data-analysis@2.0.1** is now the fastest.

![A chart showing the processing duration of multiple scripts in various languages](./assets/small-file.png)

### Big file

With _ahccd.csv_:

-   1.7 GB
-   773 cities
-   20 columns
-   22,051,025 rows
-   441,020,500 data points

The file was too big for **simple-data-analysis@1.8.1**, so it's not included here.

Again, **simple-data-analysis@2.0.1** is now the fastest option.

![A chart showing the processing duration of multiple scripts in various languages](./assets/big-file.png)

Note that DuckDB, which powers SDA, can also be used with [Python](https://duckdb.org/docs/api/python/overview.html) and [R](https://duckdb.org/docs/api/r).

## SDA in an Observable notebook

Observable notebooks are great for data analysis in JavaScript. This [example](https://observablehq.com/@nshiab/hello-simple-data-analysis) shows you how to use simple-data-analysis in one of them.

## SDA in an HTML page

If you want to add the library directly to your webpage, you can use a npm-based CDN like jsDelivr.

Here's some code that you can copy an paste into an HTML file. For more methods, check the [SimpleDB class documentation](https://nshiab.github.io/simple-data-analysis/classes/SimpleDB.html).

```html
<script type="module">
    // We import the SimpleDB class from the esm bundle.
    import { SimpleDB } from "https://cdn.jsdelivr.net/npm/simple-data-analysis/+esm"

    async function main() {
        // We start a new instance of SimpleDB
        const sdb = new SimpleDB()

        // We load daily temperatures for three cities.
        // We put the data in the table dailyTemperatures.
        await sdb.loadData(
            "dailyTemperatures",
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/dailyTemperatures.csv"
        )

        // We compute the decade from each date
        // and put the result in the decade column.
        await sdb.addColumn(
            "dailyTemperatures",
            "decade",
            "integer",
            "FLOOR(YEAR(time)/10)*10" // This is SQL
        )

        // We summarize the data by computing
        // the average dailyTemperature
        // per decade and per city.
        await sdb.summarize("dailyTemperatures", {
            values: "t",
            categories: ["decade", "id"],
            summaries: "mean",
        })

        // We run linear regressions
        // to check for trends.
        await sdb.linearRegressions("dailyTemperatures", {
            x: "decade",
            y: "mean",
            categories: "id",
            decimals: 4,
        })

        // The dailyTemperature table does not have
        // the name of the cities, just the ids.
        // We load another file with the names
        // in the table cities.
        await sdb.loadData(
            "cities",
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/cities.csv"
        )

        // We join the two tables based
        // on the ids and put the joined rows
        // in the table results.
        await sdb.join("dailyTemperatures", "cities", "id", "left", "results")

        // We select the columns of interest
        // in the table results.
        await sdb.selectColumns("results", [
            "city",
            "slope",
            "yIntercept",
            "r2",
        ])

        // We log the results table.
        await sdb.logTable("results")

        // We store the data in a variable.
        const results = await sdb.getData("results")
    }

    main()
</script>
```

And here's the table you'll see in your browser's console tab.

![The console tab in Google Chrome showing the result of simple-data-analysis computations.](./assets/browser-console.png)

## SDA with React

First, ensure that you have [NodeJS v18 or higher](https://nodejs.org/en/) installed.

Then you'll need to run this command to install the library in your code repository.

```bash
npm install simple-data-analysis
```

And here's an example with React and TypeScript. For more methods, check the [SimpleDB class documentation](https://nshiab.github.io/simple-data-analysis/classes/SimpleDB.html).

```tsx
import { useEffect, useState } from "react"

// We import the SimpleDB class.
import { SimpleDB } from "simple-data-analysis"

const Main = () => {
    // A state to store the results.
    const [results, setResults] = useState<
        { [key: string]: string | number | boolean | Date | null }[] | null
    >(null)

    // You can use sda inside a useEffect.
    useEffect(() => {
        // Because SimpleDB uses promises,
        // we need to declare an async function
        // in the useEffect hook.
        async function sdaMagic() {
            // We start a new instance of SimpleDB.
            const sdb = new SimpleDB()

            // We load daily temperatures for three cities.
            // We put the data in the table dailyTemperatures.
            await sdb.loadData(
                "dailyTemperatures",
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/dailyTemperatures.csv"
            )

            // We compute the decade from each date
            // and put the result in the decade column.
            // The calculations are written in SQL,
            // but you can also use updateWithJS to
            // use JavaScript.
            await sdb.addColumn(
                "dailyTemperatures",
                "decade",
                "integer",
                "FLOOR(YEAR(time)/10)*10" // This is SQL
            )

            // We summarize the data by computing
            // the average dailyTemperature
            // per decade and per city.
            await sdb.summarize("dailyTemperatures", {
                values: "t",
                categories: ["decade", "id"],
                summaries: "mean",
            })

            // We run linear regressions
            // to check for trends.
            await sdb.linearRegressions("dailyTemperatures", {
                x: "decade",
                y: "mean",
                categories: "id",
                decimals: 4,
            })

            // The dailyTemperature table does not have
            // the name of the cities, just the ids.
            // We load another file with the names
            // in the table cities.
            await sdb.loadData(
                "cities",
                "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/cities.csv"
            )

            // We join the two tables based
            // on the ids and put the joined rows
            // in the table results.
            await sdb.join(
                "dailyTemperatures",
                "cities",
                "id",
                "left",
                "results"
            )

            // We select the columns of interest
            // in the table results.
            await sdb.selectColumns("results", [
                "city",
                "slope",
                "yIntercept",
                "r2",
            ])

            // We log the results table.
            await sdb.logTable("results")

            // We can store the results in our state.
            setResults(await sdb.getData("results"))
        }

        // We call the async function inside the useEffect hook.
        sdaMagic()
    }, [])

    return (
        <div>
            <p>Check the console!</p>
            <p>Here are the computed results:</p>
            <p>{JSON.stringify(results, null, " ")}</p>
        </div>
    )
}
```

## SDA with NodeJS and similar runtimes

First, ensure that you have [NodeJS v20 or higher](https://nodejs.org/en/) installed.

Then you'll need to run this command to install the library in your code repository.

```bash
npm install simple-data-analysis
```

A _package.json_ file should have been created. Open it and add or change the type to "module".

```json
{
    "type": "module",
    "dependencies": {
        "simple-data-analysis": "^2.0.1"
    }
}
```

Here's some code you can copy and paste into a JavaScript file. It's the same as the one you would run in a browser, except we use the _SimpleNodeDB_ class.

This class has more methods available to load data from local files and write data to files. Check the [SimpleNodeDB class documentation](https://nshiab.github.io/simple-data-analysis/classes/SimpleNodeDB.html). Its geospatial capabilities are under development. Check the [loadGeoData](https://nshiab.github.io/simple-data-analysis/classes/SimpleGeoDB.html#loadGeoData), [area](https://nshiab.github.io/simple-data-analysis/classes/SimpleGeoDB.html#area), and [intersection](https://nshiab.github.io/simple-data-analysis/classes/SimpleGeoDB.html#intersection) methods for more information.

```ts
import { SimpleNodeDB } from "simple-data-analysis"

async function main() {
    // We start a new instance of SimpleNodeDB
    const sdb = new SimpleNodeDB()

    // We load daily temperatures for three cities.
    // We put the data in the table dailyTemperatures.
    await sdb.loadData(
        "dailyTemperatures",
        "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/dailyTemperatures.csv"
    )

    // We compute the decade from each date
    // and put the result in the decade column.
    // The calculations are written in SQL,
    // but you can also use updateWithJS to
    // use JavaScript.
    await sdb.addColumn(
        "dailyTemperatures",
        "decade",
        "integer",
        "FLOOR(YEAR(time)/10)*10" // This is SQL
    )

    // We summarize the data by computing
    // the average dailyTemperature
    // per decade and per city.
    await sdb.summarize("dailyTemperatures", {
        values: "t",
        categories: ["decade", "id"],
        summaries: "mean",
    })

    // We run linear regressions
    // to check for trends.
    await sdb.linearRegressions("dailyTemperatures", {
        x: "decade",
        y: "mean",
        categories: "id",
        decimals: 4,
    })

    // The dailyTemperature table does not have
    // the name of the cities, just the ids.
    // We load another file with the names
    // in the table cities.
    await sdb.loadData(
        "cities",
        "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/cities.csv"
    )

    // We join the two tables based
    // on the ids and put the joined rows
    // in the table results.
    await sdb.join("dailyTemperatures", "cities", "id", "left", "results")

    // We select the columns of interest
    // in the table results.
    await sdb.selectColumns("results", ["city", "slope", "yIntercept", "r2"])

    // We log the results table.
    await sdb.logTable("results")

    // We store the data in a variable.
    const results = await sdb.getData("results")
}

main()
```

Here's the command to run the file. Change _index.js_ to your actual file.

```bash
node index.js
```

And here's what you should see in your console.

![The console tab in Google Chrome showing the result of simple-data-analysis computations.](./assets/nodejs-console.png)

If you want to generate and save charts, check the [journalism library](https://github.com/nshiab/journalism), more specifically the [savePlotChart function](https://nshiab.github.io/journalism/functions/savePlotChart.html).
