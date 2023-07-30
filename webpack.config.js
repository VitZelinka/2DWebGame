module.exports = {
    entry: "./client_side/main.js",
    mode: "development",
    output: {
        filename: 'main.js',
        library: 'glb', // The name of the library (used with libraryTarget: 'var' or 'this')
        libraryTarget: 'umd', // The type of library target
    }
}