from flask import Flask
from flask import request
from flask import render_template
from flask_cors import CORS
import json
import string
from newsapi import NewsApiClient
from newsapi.newsapi_exception import NewsAPIException
application = Flask(__name__, static_url_path='')

newsapi = NewsApiClient(api_key='703823e3c5474412a750b4135484c269')
stopwords = ["","a","a's","able","about","above","according","accordingly","across","actually","after","afterwards","again","against","ain't","all","allow","allows","almost","alone","along","already","also","although","always","am","among","amongst","an","and","another","any","anybody","anyhow","anyone","anything","anyway","anyways","anywhere","apart","appear","appreciate","appropriate","are","aren't","around","as","aside","ask","asking","associated","at","available","away","awfully","b","be","became","because","become","becomes","becoming","been","before","beforehand","behind","being","believe","below","beside","besides","best","better","between","beyond","both","brief","but","by","c","c'mon","c's","came","can","can't","cannot","cant","cause","causes","certain","certainly","changes","clearly","co","com","come","comes","concerning","consequently","consider","considering","contain","containing","contains","corresponding","could","couldn't","course","currently","d","definitely","described","despite","did","didn't","different","do","does","doesn't","doing","don't","done","down","downwards","during","e","each","edu","eg","eight","either","else","elsewhere","enough","entirely","especially","et","etc","even","ever","every","everybody","everyone","everything","everywhere","ex","exactly","example","except","f","far","few","fifth","first","five","followed","following","follows","for","former","formerly","forth","four","from","further","furthermore","g","get","gets","getting","given","gives","go","goes","going","gone","got","gotten","greetings","h","had","hadn't","happens","hardly","has","hasn't","have","haven't","having","he","he's","hello","help","hence","her","here","here's","hereafter","hereby","herein","hereupon","hers","herself","hi","him","himself","his","hither","hopefully","how","howbeit","however","i","i'd","i'll","i'm","i've","ie","if","ignored","immediate","in","inasmuch","inc","indeed","indicate","indicated","indicates","inner","insofar","instead","into","inward","is","isn't","it","it'd","it'll","it's","its","itself","j","just","k","keep","keeps","kept","know","knows","known","l","last","lately","later","latter","latterly","least","less","lest","let","let's","like","liked","likely","little","look","looking","looks","ltd","m","mainly","many","may","maybe","me","mean","meanwhile","merely","might","more","moreover","most","mostly","much","must","my","myself","n","name","namely","nd","near","nearly","necessary","need","needs","neither","never","nevertheless","new","next","nine","no","nobody","non","none","noone","nor","normally","not","nothing","novel","now","nowhere","o","obviously","of","off","often","oh","ok","okay","old","on","once","one","ones","only","onto","or","other","others","otherwise","ought","our","ours","ourselves","out","outside","over","overall","own","p","particular","particularly","per","perhaps","placed","please","plus","possible","presumably","probably","provides","q","que","quite","qv","r","rather","rd","re","really","reasonably","regarding","regardless","regards","relatively","respectively","right","s","said","same","saw","say","saying","says","second","secondly","see","seeing","seem","seemed","seeming","seems","seen","self","selves","sensible","sent","serious","seriously","seven","several","shall","she","should","shouldn't","since","six","so","some","somebody","somehow","someone","something","sometime","sometimes","somewhat","somewhere","soon","sorry","specified","specify","specifying","still","sub","such","sup","sure","t","t's","take","taken","tell","tends","th","than","thank","thanks","thanx","that","that's","thats","the","their","theirs","them","themselves","then","thence","there","there's","thereafter","thereby","therefore","therein","theres","thereupon","these","they","they'd","they'll","they're","they've","think","third","this","thorough","thoroughly","those","though","three","through","throughout","thru","thus","to","together","too","took","toward","towards","tried","tries","truly","try","trying","twice","two","u","un","under","unfortunately","unless","unlikely","until","unto","up","upon","us","use","used","useful","uses","using","usually","uucp","v","value","various","very","via","viz","vs","w","want","wants","was","wasn't","way","we","we'd","we'll","we're","we've","welcome","well","went","were","weren't","what","what's","whatever","when","whence","whenever","where","where's","whereafter","whereas","whereby","wherein","whereupon","wherever","whether","which","while","whither","who","who's","whoever","whole","whom","whose","why","will","willing","wish","with","within","without","won't","wonder","would","would","wouldn't","x","y","yes","yet","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves","z","zero"]
setOfStopwords = set(stopwords)

application.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(application)

if __name__ == '__main__':
    application.run()


@application.route('/') 
def test():
    return application.send_static_file('index.html')


@application.route('/top-five-headlines/', methods = ['GET', 'POST'])
def get_top_headlines():
    top_headlines = newsapi.get_top_headlines(language='en', page_size=30)
    resultDict = {} 
    result = []
    listOfArticles = top_headlines["articles"]
    counter = 0
    for i in range(len(listOfArticles)):
        if counter == 5:
            break
        ourdict = listOfArticles[i]
        if ourdict["author"] == None or ourdict["author"] == "null":            
            continue
        if ourdict["content"] == None or ourdict["content"] == "null": 
            continue
        if ourdict["description"] == None or ourdict["description"] == "null":
            continue
        if ourdict["publishedAt"] == None or ourdict["publishedAt"] == "null":
            continue
        if ourdict["url"]==None or ourdict["url"] == "null":
            continue
        if ourdict["urlToImage"]==None or ourdict["urlToImage"] == "null":
            continue
        if ourdict["title"]==None or ourdict["title"] == "null":
            continue
        # if ourdict["source"]["id"] == None:
        #     continue
        if ourdict["source"]["name"] == None or ourdict["source"]["name"] == "null":
            continue

        counter = counter + 1
        result.append(ourdict)

    resultDict['articles']  = result
    response = application.response_class(
        response = json.dumps(resultDict),
        status = 200,
        mimetype = 'application/json'
    )
    return response


@application.route('/top-four-cnn/',methods = ['GET', 'POST'])
def get_top_five_cnn():
    topCNNHeadline = newsapi.get_top_headlines(language='en', sources='cnn', page_size=20)
    resultDict = {}
    validResponses = []
    listOfArticles = topCNNHeadline['articles']
    counter = 0
    for i in range(len(listOfArticles)):
        if counter == 4:
            break
        ourdict = listOfArticles[i]
        if ourdict["author"] == None or ourdict["author"] == "null":            
            continue
        if ourdict["content"] == None or ourdict["content"] == "null":
            continue
        if ourdict["description"] == None or ourdict["description"] == "null":
            continue
        if ourdict["publishedAt"] == None or ourdict["publishedAt"] == "null":
            continue
        if ourdict["url"]==None or ourdict["url"] == "null":
            continue
        if ourdict["urlToImage"]==None or ourdict["urlToImage"] == "null":
            continue
        if ourdict["title"]==None or ourdict["title"] == "null":
            continue
        # if ourdict["source"]["id"] == None:
        #     continue
        if ourdict["source"]["name"] == None or ourdict["source"]["name"] == "null":
            continue

        counter = counter + 1
        validResponses.append(ourdict)        
    resultDict['articles'] = validResponses
    response = application.response_class(
        response = json.dumps(resultDict),
        status = 200,
        mimetype = 'application/json'
    )
    return response
    



@application.route('/top-four-fox/',methods = ['GET', 'POST'])
def get_top_four_fox():
    topCNNHeadline = newsapi.get_top_headlines(language='en', sources='fox-news', page_size=20)
    resultDict = {}
    validResponses = []
    listOfArticles = topCNNHeadline['articles']
    counter = 0
    for i in range(len(listOfArticles)):
        if counter == 4:
            break
        ourdict = listOfArticles[i]
        if ourdict["author"] == None or ourdict["author"]=="null":            
            continue
        if ourdict["content"] == None or ourdict["content"] == 'null':
            continue
        if ourdict["description"] == None or ourdict["description"] == "null":
            continue
        if ourdict["publishedAt"] == None or ourdict["publishedAt"] == "null":
            continue
        if ourdict["url"]==None or ourdict["url"] == "null":
            continue
        if ourdict["urlToImage"]==None or ourdict["urlToImage"] == "null":
            continue
        if ourdict["title"]==None or ourdict["title"] == "null":
            continue
        # if ourdict["source"]["id"] == None:
        #     continue
        if ourdict["source"]["name"] == None or ourdict["source"]["name"] == "null":
            continue

        counter = counter + 1
        validResponses.append(ourdict)        
    resultDict['articles'] = validResponses
    response = application.response_class(
        response = json.dumps(resultDict),
        status = 200,
        mimetype = 'application/json'
    )
    return response
    

@application.route('/get-sources/', methods = ['POST'])
def getSources():
    category2 = request.form.get('category')
    print(category2)
    listOfAllSources = []
    if(category2== "all"):
        allSources = newsapi.get_sources(language='en', country='us')
        listOfAllSources = allSources["sources"]
    else:
        catSources = newsapi.get_sources(language='en', country='us', category= category2)
        listOfAllSources = catSources["sources"]
        print( "catSources ", category2)
    listOfValidSources = []
    for i in range(len(listOfAllSources)):
        if listOfAllSources[i]['country'] == 'us':
            if listOfAllSources[i]['language'] == 'en':
                listOfValidSources.append(listOfAllSources[i])
    resultDict = {}
    resultDict["sources"] = listOfValidSources
    response = application.response_class(
        response = json.dumps(resultDict),
        status = 200,
        mimetype = 'application/json'
    )
    return response
        

@application.route('/search-query/', methods =['GET'])
def search():
    resultDict = {}
    keyword = request.args.get('keyword')
    fromDate = request.args.get('fromDate')
    toDate = request.args.get('toDate')
    #category = request.form.get('category')
    source = request.args.get('sources')

    try:
        if(source == "all"):
            searchResults = newsapi.get_everything(q = keyword, from_param=fromDate, to=toDate, sort_by='publishedAt', page_size=30, language='en')
        else: 
            searchResults = newsapi.get_everything(q = keyword, from_param=fromDate, to=toDate, sources=source, sort_by='publishedAt', page_size=30, language='en')
        resultDict['responseCode'] = 1
        listOfArticles = searchResults['articles']
        validResponses = []
        for i in range(len(listOfArticles)):
            # print(i)
            # print(listOfArticles)
            ourdict = listOfArticles[i]
            if ourdict["author"] == None or ourdict["author"] == "null":            
                continue
            if ourdict["content"] == None or ourdict["content"] == "null":
                continue
            if ourdict["description"] == None or ourdict["description"] == "null":
                continue
            if ourdict["publishedAt"] == None or ourdict["publishedAt"] == "null":
                continue
            if ourdict["url"]==None or ourdict["url"] == "null":
                continue
            if ourdict["urlToImage"]==None or ourdict["urlToImage"] == "null":
                continue
            if ourdict["title"]==None or ourdict["title"] == "null":
                continue
            # if ourdict["source"]["id"] == None:
            #     continue
            if ourdict["source"]["name"] == None or ourdict["source"]["name"] == "null":
                continue
            validResponses.append(ourdict)     

        resultDict['searchResults'] =validResponses
        response = application.response_class(
            response = json.dumps(resultDict),
            status = 200,
            mimetype = 'application/json'
        )
    except Exception as e:
        j = NewsAPIException.get_message(e)
        resultDict['responseCode'] = 2
        resultDict['errorMessage'] = j
        resultDict['searchResults'] = []
        print(resultDict)
        response = application.response_class(
            response = json.dumps(resultDict),
            status = 200, 
            mimetype = 'application/json'
        )
    print(response)
    return response


@application.route('/word-cloud/',methods = ['GET', 'POST'])
def wordCloudFrequency():
    resultDict = {}
    top_headlines = newsapi.get_top_headlines(language='en', page_size=100, country='us')
    listOfArticles = top_headlines["articles"]
    currentTitle = []
    

    frequency = {}
    for i in range(0,len(listOfArticles)):
        ourdict = listOfArticles[i]
        if ourdict["title"] == None:            
            continue
        else: 
            title = ourdict["title"]
            title = title.translate(str.maketrans('', '', string.punctuation))
            #print(title)
            currentTitle = title.split(" ")
            currentTitle = [x for x in currentTitle if not x.isnumeric()]
            currentTitle = [w for w in currentTitle if w.lower() not in setOfStopwords]
            for j in range(len(currentTitle)):
                word = currentTitle[j].lower()
                if word in frequency:
                    frequency[word] = frequency[word] +1
                else:
                    frequency[word] = 1
    frequency ={k: v for k, v in sorted(frequency.items(), key=lambda item: item[1], reverse= True)}
    result = list(frequency)
    j = {}
    #print(result)
    for k in range(0,30):
        word = result[k]
        j[word] = frequency[word]

    resultDict["frequency"]=j

    response = application.response_class(
        response = json.dumps(resultDict),
        status = 200,
        mimetype = 'application/json'
    )

    return response
