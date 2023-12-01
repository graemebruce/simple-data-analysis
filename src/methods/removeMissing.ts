import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"
import SimpleDB from "../indexWeb.js"
import removeMissingQuery from "./removeMissingQuery.js"

export default async function removeMissing(
    simpleDB: SimpleDB,
    table: string,
    options: {
        columns?: string | string[]
        missingValues?: (string | number)[]
        invert?: boolean
    } = {}
) {
    simpleDB.debug && console.log("\nremoveMissing()")
    options.missingValues = options.missingValues ?? [
        "undefined",
        "NaN",
        "null",
        "",
    ]
    simpleDB.debug && console.log("parameters:", { table, options })

    const types = await simpleDB.getTypes(table)
    const allColumns = Object.keys(types)

    options.missingValues = options.missingValues ?? [
        "undefined",
        "NaN",
        "null",
        "",
    ]

    options.columns = stringToArray(options.columns ?? [])

    await queryDB(
        simpleDB,
        removeMissingQuery(
            table,
            allColumns,
            types,
            options.columns.length === 0 ? allColumns : options.columns,
            options
        ),
        mergeOptions(simpleDB, { table })
    )
}
