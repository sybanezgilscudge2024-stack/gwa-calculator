let subjectCode = {};
let subjectDB = {}; // empty for now

// Fetch JSON file
fetch("college.json")
.then((res) => res.json())
.then((data) => {
    subjectCode = data;

    // Now you can safely create subjectDB
    subjectDB = {
    "BSIT": {
        "1-1": [
        subjectCode["ITCC41"],
        subjectCode["ITCC43"],
        subjectCode["GEC11"],
        subjectCode["GEC14"],
        subjectCode["GEC15"],
        subjectCode["PE31"],
        subjectCode["GEC18"]
        
        ],
        "1-2": [
        subjectCode["ITCC42"],
        subjectCode["ITCC44"],
        subjectCode["GEC13"],
        subjectCode["GEC12"],
        subjectCode["GEC16"],
        subjectCode["GEE16"],
        subjectCode["GEC19"],
        subjectCode["PE32"]
        ],
        "2-1": [
        subjectCode["ITCC45"],
        subjectCode["ITCC46"],
        subjectCode["ITCC47"],
        subjectCode["ITCC48"],
        subjectCode["ITCC49"],
        subjectCode["GEE11"],
        subjectCode["GEC17"],
        subjectCode["PE33"]
        ],
        "2-2": [],
        "3-1": [],
        "3-2": [],
        "4-1": [],
        "4-2": []
    },


    "BSVM": {
        "1-1": [
        subjectCode["GEC11"],
        subjectCode["GEC12"],
        subjectCode["GEC14"],
        subjectCode["GEE11"],
        subjectCode["CHY32"],
        subjectCode["CHY32.1"],
        subjectCode["PE31"],


        ],
        "1-2": [
        subjectCode["GEC13"],
        subjectCode["GEC15"],
        subjectCode["GEC17"],
        subjectCode["GEE15"],
        subjectCode["VPY40"],
        subjectCode["PE32"]
        ],
        "2-1": [
        subjectCode["GEC16"],
        subjectCode["GEC19"],
        subjectCode["VZT51"],
        subjectCode["VZT53"],
        subjectCode["VZT55"],
        subjectCode["VAN51"],
        subjectCode["VAN53"],
        subjectCode["PE33"]
        
        ],
        "2-2": [
        subjectCode["GEC18"],
        subjectCode["GEE19"],
        subjectCode["VZT52"],
        subjectCode["VZT54"],
        subjectCode["VAN52"],
        subjectCode["VAN54"],
        subjectCode["PE34"]
        
        ],



        "3-1": [
        subjectCode["VZT61"],
        subjectCode["VZT63"],
        subjectCode["VZT65"],
        subjectCode["VPY61"],
        subjectCode["VMC61"],
        subjectCode["VPT61"],
        subjectCode["VPM61"]
        
        ],





        "3-2": [
        subjectCode["VPY62"],
        subjectCode["VMC62"],
        subjectCode["VPR60"],
        subjectCode["VPT62"],
        subjectCode["VPM62"],
        subjectCode["VPM64"],
        
        ],







        "4-1": [
        subjectCode["VPY71"],
        subjectCode["VMD71"],
        subjectCode["VMD73"],
        subjectCode["VMC73"],
        subjectCode["VPR71"],
        subjectCode["VPT73"],
        subjectCode["VSG71"],
        ],


        "4-2": [
        subjectCode["VMC74"],
        subjectCode["VMC76"],
        subjectCode["VMD72"],
        subjectCode["VMD74"],
        subjectCode["VMD76"],
        subjectCode["VMD78"],
        subjectCode["VMD80"],
        subjectCode["VMD95"],
        ],



    }








    };
    console.log(subjectDB)
    populateCollegeSelect(); // call after subjectDB is ready
})
.catch((err) => console.error("Error loading subjects:", err));
