var url = 'https://www.ics.uci.edu/~pattis/ICS-33/ics33win18grades.zip';
zip.createReader(new zip.HttpReader(url), function(zipReader){
   zipReader.getEntries(function(entries){
      alert(entries)
   });
}, onerror);