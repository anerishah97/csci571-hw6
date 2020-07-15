//const serverURL = "http://pythonappEnv-env.9kdmwbcvs3.us-east-1.elasticbeanstalk.com";
const serverURL = "";
 const topFiveHeadlines = "../top-five-headlines/";
const wordCloudFrequency = "/word-cloud/";
const topFourFoxNews = "/top-four-fox/";
const topFourCNNNews = "../top-four-cnn/";
 const searchURL = "/search-query/";
var slideIndex = 0;
var expanded = 0;
var activePage = 0;

var showMoreButton = 0;
//activePage = 0 means home page is active
//activePage = 1 means search Page is active

window.onload = function sliderTopHeadlines(){
     document.getElementById('toDate').valueAsDate = new Date();
     var currentCategory = document.getElementById("category").value;
     getAllSources(currentCategory);
     var form = document.getElementById("myForm");
function handleForm(event) { event.preventDefault(); } 
form.addEventListener('submit', handleForm);

    document.getElementById('fromDate').valueAsDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    var url = serverURL + topFiveHeadlines;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.onload = function(e){
        if(xhr.readyState === 4)
        {
            if(xhr.status === 200)
            {
                var responseTopFiveHeadline = xhr.responseText;
                slideshow(responseTopFiveHeadline);

            }
            else{
                console.log(xhr.statusText);
            }
        }
    };

    xhr.onerror = function(e){
        console.error(xhr.statusText);
    };
    xhr.send(null);
};

function resetForm(){
    var keyword = document.getElementById('keyword');
    if(keyword)
        keyword.value = "";
    document.getElementById('toDate').valueAsDate = new Date();
    document.getElementById('fromDate').valueAsDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    document.getElementById('category').selectedIndex = 0;
    document.getElementById('select-sources').selectedIndex = 0;
    document.getElementById('list-of-articles').innerHTML = "";
    document.getElementById('list-of-articles-2').innerHTML = "";
    document.getElementById('show-more').innerHTML = "Show more";
    //expanded = 0;
    document.getElementById('show-more').style.display  = "none";
    
    getAllSources("all");
   
}

function getAllSources(categoryParam)
{
    if(categoryParam == 'testParam')
    {
        var e = document.getElementById('category');
        categoryParam = e.options[e.selectedIndex].value;
    }

    //console.log(categoryParam);
    var url = serverURL + "/get-sources";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.onreadystatechange = function() { 
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            var response = xhr.responseText;
            populateSources(response);
            //console.log(response);
        }
    }

    let formData = new FormData(); // creates an object, optionally fill from <form>
    formData.append("category", categoryParam); // appends a field
    //s = "category=" + categoryParam;
    //console.log(s);
    xhr.send(formData);
}


function populateSources(jsonResponse)
{
    var sourcesResponse = JSON.parse(jsonResponse);
    var htmlText = "";
    var selectSources = document.getElementById("select-sources");
    var listOfJSONSources = sourcesResponse["sources"];
    var k = listOfJSONSources[0]["name"];
    //console.log("kkk" + k);
    //console.log(listOfJSONSources);
    //var i;
    htmlText+="<option value = 'all' default>All</option>"
    for(var i=0;i<Math.min(10, listOfJSONSources.length);i++)
    {
        htmlText+= "<option value = '" + listOfJSONSources[i]["id"] + "'> " + listOfJSONSources[i]["name"] + "</option>"
    }

    htmlText+="</select>";
    selectSources.innerHTML = htmlText;

}


function searchWithParams()
{
    var url = serverURL + searchURL;
    var keyWord = document.getElementById("keyword").value;
    var e = document.getElementById('select-sources');
    var sources = e.options[e.selectedIndex].value;

    var fD = document.getElementById("fromDate").value;
    var splittedFromDate = fD.split("-");
    var fromDate = new Date(splittedFromDate[0], splittedFromDate[1]-1, splittedFromDate[2]);

    var tD = document.getElementById('toDate').value;
    var splittedToDate = tD.split("-");
    var toDate = new Date(splittedToDate[0], splittedToDate[1]-1, splittedToDate[2]);
    console.log("keyword is " + keyWord);
    if(fromDate.getTime()>toDate.getTime())
    {
        alert("Incorrect time");
    }
    
    else if(keyWord!="" && tD!="" && fD!="") 
    {
        
        console.log("in else if");
        var fromDateFormat = fromDate.getFullYear()+"-"+('0' + (fromDate.getMonth()+1)).slice(-2)+"-"+('0' + fromDate.getDate()).slice(-2);

        var toDateFormat = toDate.getFullYear()+"-"+('0' + (toDate.getMonth()+1)).slice(-2)+"-"+('0' + toDate.getDate()).slice(-2);
        url = url+"?keyword=" + keyWord+"&fromDate="+fromDateFormat+"&toDate="+toDateFormat+"&sources="+sources;
        var xhrSearch = new XMLHttpRequest();
        xhrSearch.open("GET", url, true);
        xhrSearch.onload = function(e){
            if(xhrSearch.readyState === 4)
            {
                if(xhrSearch.status === 200)
                {
                    var responseForSearch= xhrSearch.responseText;
                    setUpSearchCards(responseForSearch);
                    //console.log(responseForSearch);
                    //wordCloudSetUp(responseForWordCloud);
                }
                else
                {
                    console.log(xhrSearch.statusText);
                }
            }
        }
        xhrSearch.onerror = function(e){
            console.error(xhrSearch.statusText);
        };
        xhrSearch.send(null);
    }
    else{}

}

function truncateDescription(fullDescription)
{
    var splittedDescription = fullDescription.split(" ");
    var descriptionWithSpans = "";
    for(var i=0;i<splittedDescription.length;i++)
    {
        descriptionWithSpans+= " <span class = 'description-span'>" + splittedDescription[i] + "</span>";
    }
    return descriptionWithSpans;
}

function setUpSearchCards(responseText){
    expanded = 0;

    var jsonResponse = JSON.parse(responseText);
    document.getElementById("show-more").style.display = "none";

    htmlText = "";
    htmlText2 = "";
    var responseCode = jsonResponse["responseCode"];
    if(responseCode == 1){
        var divToAppend = document.getElementById("list-of-articles");
        var extraDivToAppend = document.getElementById("list-of-articles-2");
        var listOfArticles = jsonResponse["searchResults"];
        if(listOfArticles.length == 0){
            htmlText += "No results found";

        }
        else{
            var totalLength = listOfArticles.length
            for(var i=0;i<Math.min(5,listOfArticles.length);i++)
            {
                originalDescription = "";
                var currentArticle = listOfArticles[i];
                var publishedDate = currentArticle["publishedAt"];
                publishedDate = publishedDate.substring(0,10);
                var d = publishedDate.split("-");
                finalDate = d[1] + "/" + d[2] +"/" + d[0];
                editedDescription = truncateDescription(currentArticle["description"]);
                completeDescription = currentArticle["description"];
                htmlText+='<div class="card-list-of-articles card-articles">';
                htmlText+=' <div id = "left-image-articles">';
                htmlText+='<img src="'+currentArticle["urlToImage"]+'" class="list-of-articles-image">';
                htmlText+='</div>';
                htmlText+='  <div id = "center-content-articles">';
                htmlText+='<p class= "article-title">'+currentArticle["title"]+'</p>';
                htmlText+='<p class="no-margin article-author"><span class="bold">Author:</span>'+currentArticle["author"]+'</p>';
                htmlText+='<p class = "article-source no-margin"><span class="bold">Source: </span>'+currentArticle["source"]["name"]+' </p>';
                htmlText+='<p class = "article-date no-margin"><span class="bold">Date: </span>'+finalDate+' </p>';
                htmlText+= '<p class = "article-description no-margin complete-description" style = "display:none">'+currentArticle["description"]+'</p>';
                htmlText+= '<p class = "article-description no-margin one-line-description">'+editedDescription+'</p>';
                htmlText+= '<p class = "article-href"><a href = "'+currentArticle["url"]+'" target = "_blank">See original post</a></p>';
                htmlText+='</div>';
                htmlText+=' <div class ="right-cross-article">';
                htmlText+=' <p class = "p-right-cross no-margin">&times;</p>';
                htmlText+='  </div>';
                htmlText+='</div>';
            }
            if(totalLength >5)
            {
                document.getElementById("show-more").style.display = "block";
            }

            for(var j=5; j<Math.min(15, listOfArticles.length); j++)
            {
                var currentArticle = listOfArticles[j];
                var editedNewDescription = truncateDescription(currentArticle["description"]);
                var publishedDate = currentArticle["publishedAt"];
                publishedDate = publishedDate.substring(0,10);
                var d = publishedDate.split("-");
                finalDate = d[1] + "/" + d[2] +"/" + d[0];
                console.log(finalDate);
                console.log("YO " + editedNewDescription)
                htmlText2+='<div class="card-list-of-articles card-articles">';
                htmlText2+=' <div id = "left-image-articles">';
                htmlText2+='<img src="'+currentArticle["urlToImage"]+'" class="list-of-articles-image">';
                htmlText2+='</div>';
                htmlText2+='  <div id = "center-content-articles">';
                htmlText2+='<p class= "article-title">'+currentArticle["title"]+'</p>';
                htmlText2+='<p class="no-margin article-author"><span class="bold">Author:</span>'+currentArticle["author"]+'</p>';
                htmlText2+='<p class = "article-source no-margin"><span class="bold">Source: </span>'+currentArticle["source"]["name"]+' </p>';
                htmlText2+='<p class = "article-date no-margin"><span class="bold">Date: </span>'+finalDate+' </p>';
                htmlText2+= '<p class = "article-description no-margin complete-description" style = "display:none">'+currentArticle["description"]+'</p>';
                htmlText2+= '<p class = "article-description no-margin one-line-description">'+editedNewDescription+'</p>';
                htmlText2+= '<p class = "article-href"><a href = "'+currentArticle["url"]+'" target = "_blank">See original post</a></p>';
                htmlText2+='</div>';
                htmlText2+=' <div class ="right-cross-article">';
                htmlText2+=' <p class="no-margin p-right-cross">&times;</p>';
                htmlText2+='<div></div>'
                htmlText2+='  </div>';
                htmlText2+='</div>';
            }
        }
        divToAppend.innerHTML = htmlText;
        extraDivToAppend.innerHTML = htmlText2;
        extraDivToAppend.style.display = "none";
        articleExpansion2();
    }
    else if(responseCode == 2){
        var errorMessage = jsonResponse["errorMessage"];
        alert(errorMessage);
    }
}

function expandCollapse(){
    if(expanded == 0)
    {
        expanded = 1;
        var divToChange = document.getElementById("list-of-articles-2");
        divToChange.style.display = "flex";
        document.getElementById("show-more").innerHTML = "Show less";
    }
    else
    {
        expanded = 0;
        var divToChange = document.getElementById("list-of-articles-2");
        divToChange.style.display = "none";
        document.getElementById("show-more").innerHTML = "Show More";
    }
}

function articleExpansion2() {


    var articles = document.getElementsByClassName("card-articles");
    for(var i=0;i<articles.length;i++)
    {
        //child 0 => Title
        //child 1 => Author
        //child 2 => Source
        //child 3 => Date
        //child 4 => Complete Description
        //child 5 => Edited Description
        //child 6 => See original post
        var divTwo = articles[i].children[1];
        var divOne = articles[i].children[0];


        divOne.addEventListener("click", function () {
            console.log("YOO");
            divTwo = divOne.parentNode.children[1];
            var articleAuthor = divTwo.children[1];
            var articleSource = divTwo.children[2];
            var articleDate = divTwo.children[3];
            var articleCompleteDescription = divTwo.children[4];
            var articleShortDescription =divTwo.children[5];
            var originalPost = divTwo.children[6];

            articleSource.style.display = "block";
            articleDate.style.display="block";
            articleCompleteDescription.style.display = "block";
            articleAuthor.style.display = "block";
            originalPost.style.display="block";

            articleShortDescription.style.display = "none";
            divThree = divTwo.parentNode.children[2];
            divThree.style.display = "block";
            

        });

        divTwo.addEventListener("click", function () {
            divTwo = this;
            var articleAuthor = divTwo.children[1];
            var articleSource = divTwo.children[2];
            var articleDate = divTwo.children[3];
            var articleCompleteDescription = divTwo.children[4];
            var articleShortDescription =divTwo.children[5];
            var originalPost = divTwo.children[6];

            articleSource.style.display = "block";
            articleDate.style.display="block";
            articleCompleteDescription.style.display = "block";
            articleAuthor.style.display = "block";
            originalPost.style.display="block";

            articleShortDescription.style.display = "none";
            divThree = divTwo.parentNode.children[2];
            divThree.style.display = "block";
            divTwo.style.cursor = "text";


        });


      
        // articles[i].children[2].addEventListener("click", function () {
        //     this.parentNode.children[1].children[1].style.display = "none";   
        //     this.parentNode.children[1].children[2].style.display = "none";    
        //     this.parentNode.children[1].children[3].style.display = "none";    
        //     this.parentNode.children[1].children[4].style.display = "none";    
        //     this.parentNode.children[1].children[6].style.display = "none";    
        //     this.parentNode.children[1].children[5].style.display = "block";    
        //     this.style.display="none";
            
        //     });

            articles[i].children[2].children[0].addEventListener("click", function () {
                this.parentNode.parentNode.children[1].children[1].style.display = "none";   
                this.parentNode.parentNode.children[1].children[2].style.display = "none";    
                this.parentNode.parentNode.children[1].children[3].style.display = "none";    
                this.parentNode.parentNode.children[1].children[4].style.display = "none";    
                this.parentNode.parentNode.children[1].children[6].style.display = "none";    
                this.parentNode.parentNode.children[1].children[5].style.display = "block";    
                this.parentNode.style.display="none";
                this.parentNode.parentNode.children[1].style.cursor = "pointer";
                
                
                });
    }
}

function wordCloudRequest(){
    var url = serverURL + wordCloudFrequency;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function(e){
        if(xhr.readyState === 4)
        {
            if(xhr.status === 200)
            {
                var responseForWordCloud = xhr.responseText;
                //console.log(responseForWordCloud);
                wordCloudSetUp(responseForWordCloud);
            }
            else
            {
                console.log(xhr.statusText);
            }
        }
    }
    xhr.onerror = function(e){
        console.error(xhr.statusText);
    };
    xhr.send(null);
};

function setUpCardViewFoxNews(responseForFoxNews)
{
    var CNNJSONresponse = JSON.parse(responseForFoxNews);
    var responseDict = CNNJSONresponse["articles"];
    var foxFlexContainer = document.getElementById("flex-container-fox");
    htmlText = "";
    for(var i=0;i<responseDict.length;i++)
    {
        var urlToImage = responseDict[i]["urlToImage"];
        var title = responseDict[i]["title"];
        var description = responseDict[i]["description"];
        var url = responseDict[i]["url"];
        htmlText+= "<a style = 'text-decoration:none; color:#000' href = '" + url + "' target = '_blank'";
        htmlText += "<div class = 'card'>";
        htmlText += "<img class = 'card-image' src = '" + urlToImage + "'>";
        htmlText+= "<div class = 'card-container'>";
        htmlText+="<p style = 'font-weight:bold' >" + title + "</p>";
        htmlText+="<p>" + description+ "</p>";
        htmlText+="</div></div>";
        htmlText+="</a>";
    }
    var lengthOfResponseDict = responseDict.length;
    if(lengthOfResponseDict<4)
    {
        while(lengthOfResponseDict!=4)
        {
            lengthOfResponseDict = lengthOfResponseDict+1;
            var urlToImage ="";
            var title = "";
            var description = "";
            var url = "";
            htmlText+= "<a style = 'text-decoration:none; color:#000' href = '" + "" + "' target = '_blank'";
            htmlText += "<div class = 'card'>";
            htmlText += "<img class = 'card-image' src = '" + "" + "'>";
            htmlText+= "<div class = 'card-container'>";
            htmlText+="<p style = 'font-weight:bold' >" + "" + "</p>";
            htmlText+="<p>" + ""+ "</p>";
            htmlText+="</div></div>";
            htmlText+="</a>";
        }
    }

    foxFlexContainer.innerHTML = htmlText;
}

function foxNews(){
    var url = serverURL + topFourFoxNews;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function(e){
        if(xhr.readyState === 4)
        {
            if(xhr.status === 200)
            {
                var responseForFoxNews = xhr.responseText;
                setUpCardViewFoxNews(responseForFoxNews);
            }
            else
            {
                console.log(xhr.statusText);
            }
        }
    }

    xhr.onerror = function(e)
    {
        console.log(xhr.statusText);
    };
    xhr.send();

};

function cnnNews(){
    var url = serverURL + topFourCNNNews;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function(e){
        if(xhr.readyState === 4)
        {
            if(xhr.status === 200)
            {
                var responseForCNNNews = xhr.responseText;
                setUpCardViewCNNNews(responseForCNNNews);
            }
            else
            {
                console.log(xhr.statusText);
            }
        }
    }

    xhr.onerror = function(e)
    {
        console.log(xhr.statusText);
    };
    xhr.send();
}

function setUpCardViewCNNNews(responseForCNNNews){

    var CNNJSONresponse = JSON.parse(responseForCNNNews);
    var responseDict = CNNJSONresponse["articles"];
    var cnnFlexContainer = document.getElementById("flex-container-cnn");
    htmlText = "";
    for(var i=0;i<responseDict.length;i++)
    {
        var urlToImage = responseDict[i]["urlToImage"];
        var title = responseDict[i]["title"];
        var description = responseDict[i]["description"];
        var url = responseDict[i]["url"];
        htmlText+= "<a style = 'text-decoration:none; color:#000' href = '" + url + "' target = '_blank'";
        htmlText += "<div class = 'card'>";
        htmlText += "<img class = 'card-image' src = '" + urlToImage + "'>";
        htmlText+= "<div class = 'card-container'>";
        htmlText+="<p style = 'font-weight:bold' >" + title + "</p>";
        htmlText+="<p>" + description+ "</p>";
        htmlText+="</div></div>";
        htmlText+="</a>";
    }

    var lengthOfResponseDict = responseDict.length;
    if(lengthOfResponseDict<4)
    {
        while(lengthOfResponseDict!=4)
        {
            lengthOfResponseDict = lengthOfResponseDict+1;
            var urlToImage ="";
            var title = "";
            var description = "";
            var url = "";
            htmlText+= "<a style = 'text-decoration:none; color:#000' href = '" + "" + "' target = '_blank'";
            htmlText += "<div class = 'card'>";
            htmlText += "<img class = 'card-image' src = '" + "" + "'>";
            htmlText+= "<div class = 'card-container'>";
            htmlText+="<p style = 'font-weight:bold' >" + "" + "</p>";
            htmlText+="<p>" + ""+ "</p>";
            htmlText+="</div></div>";
            htmlText+="</a>";
        }
    }

    cnnFlexContainer.innerHTML = htmlText;
}



function hover(b){
    b.style.backgroundColor = "#46B04F";
    b.style.color = "#fff";
}

function searchFormOnMouseOver(button)
{
    button.style.backgroundColor = "#46B04F";
    button.style.color = "#fff";
}

function searchFormOnMouseOut(button)
{
    button.style.backgroundColor = "#DBDBD8";
    button.style.color = "#000";
}

function backToNormal(b)
{
   
    if(activePage==0){
        var buttonToBeEnabled= document.getElementById("homePage");
        var buttonToBeDisabled = document.getElementById("searchPage");
        buttonToBeEnabled.style.backgroundColor = "#555555";
        buttonToBeDisabled.style.backgroundColor = "#F3F3F3";
        buttonToBeEnabled.style.color = "#fff";
        buttonToBeDisabled.style.color = "#000";
    }
    else
    {
        var buttonToBeEnabled= document.getElementById("searchPage");
        var buttonToBeDisabled = document.getElementById("homePage");
    
        
        buttonToBeEnabled.style.backgroundColor = "#555555";
        buttonToBeDisabled.style.backgroundColor = "#F3F3F3";
        buttonToBeEnabled.style.color = "#fff";
        buttonToBeDisabled.style.color = "#000";
    }
}

function homePage()
{
    var divToShow = document.getElementById("right-side-main-page");
    divToShow.style.display = "contents";

    var buttonToBeEnabled= document.getElementById("homePage");
    var buttonToBeDisabled = document.getElementById("searchPage");
    activePage = 0;
    // buttonToBeEnabled.style.backgroundColor = "#555555";
     buttonToBeDisabled.style.backgroundColor = "#F3F3F3";
    // buttonToBeEnabled.style.color = "#fff";
     buttonToBeDisabled.style.color = "#000";
    var divToHide = document.getElementById("right-side-second-page");
    divToHide.style.display= "none";
}


function searchPage()
{
    var divToHide = document.getElementById("right-side-main-page");
    divToHide.style.display = "none";
    activePage=1;

    var buttonToBeEnabled= document.getElementById("searchPage");
    var buttonToBeDisabled = document.getElementById("homePage");

    
    // buttonToBeEnabled.style.backgroundColor = "#555555";
    buttonToBeDisabled.style.backgroundColor = "#F3F3F3";
    // buttonToBeEnabled.style.color = "#fff";
    buttonToBeDisabled.style.color = "#000";
    var divToShow = document.getElementById("right-side-second-page");
    divToShow.style.display = "block";

}

function wordCloudSetUp (responseForWordCloud){
    var jsonResponse = JSON.parse(responseForWordCloud);
    var frequencies = jsonResponse["frequency"];
     var objectKeys = Object.keys(frequencies);
     var wordCloudArray = new Array();
     for(var i=0;i<objectKeys.length;i++)
     {
         var wordVar = objectKeys[i];
         var frequencyOfWord = frequencies[wordVar];
         var obj = {word: wordVar, size: Math.min(frequencyOfWord*8, 40)};
         wordCloudArray.push(obj);
     }

    wordCloudCreation(wordCloudArray);
}


function wordCloudCreation(wordCloudArray)
{
     // List of words
     var myWords =wordCloudArray;
    //console.log(d3);

     // set the dimensions and margins of the graph
     var margin = {top: 10, right: 10, bottom: 10, left: 10},
         width = 300 - margin.left - margin.right,
         height = 300 - margin.top - margin.bottom;
     
     // append the svg object to the body of the page
     var svg = d3.select("#my_dataviz").append("svg")
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
       .append("g")
         .attr("transform",
               "translate(" + margin.left + "," + margin.top + ")");
     
     // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
     // Wordcloud features that are different from one word to the other must be here
     var layout = d3.layout.cloud()
       .size([width, height])
       .words(myWords.map(function(d) { return {text: d.word, size:d.size}; }))
       .padding(5)        //space between words
       .rotate(function() { return ~~(Math.random() * 2) * 90; })
       .fontSize(function(d) { return d.size; })      // font size of words
       .on("end", draw);
     layout.start();
     
     // This function takes the output of 'layout' above and draw the words
     // Wordcloud features that are THE SAME from one word to the other can be here
     function draw(words) {
       svg
         .append("g")
           .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
           .selectAll("text")
             .data(words)
           .enter().append("text")
             .style("font-size", function(d) { return d.size + "px"; })
             .style("fill", "#000")
             .attr("text-anchor", "start")
             .attr("text-anchor", "middle")
             .style("font-family", "Impact")
             .attr("transform", function(d) {
               return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
             })
             .text(function(d) { return d.text; });
     }
}

function slideshow(responseTopFiveHeadlines)
{
    var htmlText = "";
    var jsonResponse = JSON.parse(responseTopFiveHeadlines);
    var slideshowContainer = document.getElementById("slideshow-container");
    for(var i=0;i<5;i++)
    {

        var title = jsonResponse["articles"][i]["title"];
        var imageURL = jsonResponse["articles"][i]["urlToImage"];
        var description = jsonResponse["articles"][i]["description"];
        var linkURL = jsonResponse["articles"][i]["url"]; 
        htmlText+="<div class = 'just-for-display'";
        if(i == 0)
        {
            htmlText+=">";

        }
        else
        {
            htmlText+=" style = 'display:none'>";

        }
        htmlText+="<a href = '" + linkURL + "' target = '_blank'>";

        htmlText+= "<img src = '" + imageURL + "' id = 'slideshow-image' alt = 'image'>";
        htmlText+= "<div class = 'slideshow-text'> <p style = 'font-size:18px; font-weight:bold'> " + title + " </h2> ";
        htmlText+= "<p> "  + description + "</p>";
        htmlText+= "</div></div>";
        htmlText+="</a>"
    }

    slideshowContainer.innerHTML = htmlText;
    wordCloudRequest();
    foxNews();
    cnnNews();
    startSlideShow();
}



function startSlideShow(){
    var slides = document.getElementsByClassName("just-for-display");
    var i;
    for(var i=0; i<5;i++)
    {
        slides[i].style.display = "none";
    }
    slideIndex++;
  if (slideIndex > slides.length) 
  {
      slideIndex = 1;
    }
  slides[slideIndex-1].style.display = "";
  
  setTimeout(startSlideShow, 3000); // Change image every 2 seconds
}