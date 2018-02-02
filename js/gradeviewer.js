function findHashIndex(hashID, grades){
    for (i = 0; i < grades.length; i++){
        console.log(grades[i][0]);
        if (grades[i][0] == hashID){
            return i
        }
    }
}
