# [ICS 33 Grade Viewer](http://www.ics.uci.edu/~ccarnaro/ics33gradeviewer.html)
This website allows students in Pattis's [ICS 33](https://www.ics.uci.edu/~pattis/ICS-33/) class to view their grades online.
Simply enter your hash id and your grades will be displayed.

<html>
    <img src="https://i.imgur.com/5Jug5j3.png" alt="Screenshot of ICS 33 GradeViewer" height="400">
</html>  


## How It Works
#### Overview
When the *ICS 33 Grade Viewer* opens, it loads the current grades file from the [ICS 33 website](https://www.ics.uci.edu/~pattis/ICS-33/), gets the data from within the file, puts it into an HTML table, and then displays it to the user.

#### In Depth
The *ICS 33 Grade Viewer* is a static website.
This means that there is no backend server; everything is done on the frontend with Javascript.

When the *ICS 33 Grade Viewer* loads on a user's browser, it sends two XMLHttpRequest to the ICS 33 website.
1. The first is to scrape the website looking for the url of the grades zip.
2. The second is to load the grades zip file from the scraped url.

Normally, these requests would require a backend and wouldn't be possible on the frontend because of the [CORS same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), which blocks Javascript requests from the browser to other websites. However, since the *ICS 33 Grade Viewer* and the ICS 33 website are both hosted on the same domain (ics.uci.edu), this restriction doesn't apply.
The benefit to doing everything on the frontend is that there are no server costs!

Once the *ICS 33 Grade Viewer* has loaded the zipped grades file, it unzips this file using the [JSZip](https://stuk.github.io/jszip/) library and then converts the inner .xslm file to a JSON object using the [SheetJS](http://sheetjs.com/) library.

Inside of the JSON object, it contains the property referring to the grades (e.g. "Winter 2018").
This property has a two dimensional array, which can be represented as [row[column]].
Rows 0-6 contain data representing statistics for the class.
Starting at row 7, we have data for each hash id.
If a grade has not yet be inputed, then there is a null.
After the hash ids, there are a lot of empty lists, which can be ignored.

This data gets set to a global variable called `grades_json` and is printed to `console.log`

The user can then choose to view all of the grades in the class or just the grades of a single Hash Id.
If the user inputs a Hash Id, that Id is saved as a cookie so that the *ICS 33 Grade Viewer* can remember their Id for the next time that they visit the site.

## Get Setup To Develop Locally

1. **Clone the repository**  
`git clone https://github.com/ChaseC99/ICS33-Grade-Viewer.git`

2. **Navigate into the "*ICS-33-Grade-Viewer*" Folder**  
`cd ICS-33-Grade-Viewer`

3. **Run the website on your local host**  
`python3 -m http.server`

4. **Navigate to "*[localhost:8000](localhost:8000)*" in your browser**

**The website will only work if you run it on local host.**  
Because of the [CORS same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), you won't be able to load the grades from the ICS 33 website.
I've included a file called `test_grades.zip` in the "*ICS-33-Grade-Viewer*" folder, so that you can still test your code.
Just make sure that `use_local_test_file` is set to `true` in [*js/gradviewer.js*](https://github.com/ChaseC99/ICS33-Grade-Viewer/blob/master/js/gradeviewer.js#L16)

If you want to help improve the *ICS 33 Grade Viewer*, play around with the code and make a pull request!

Feel free to reach out if you have any questions :)

## Contributors
[Chase Carnaroli](https://www.linkedin.com/in/ChaseCarnaroli)  
[Miles Hong](https://www.linkedin.com/in/miles-hong-a74ba3155/)  
[Tristan Jogminas](https://www.linkedin.com/in/tristan-jogminas/)  
[William Sun](https://www.linkedin.com/in/willsunnn/)
