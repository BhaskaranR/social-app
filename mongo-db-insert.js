var minDate = new Date(2012, 0, 1, 0, 0, 0, 0);
var maxDate = new Date(2013, 0, 1, 0, 0, 0, 0);
var delta = maxDate.getTime() - minDate.getTime();
 
var job_id = arg2;
 
var documentNumber = arg1;
var batchNumber = 5 * 1000;
 
var job_name = 'Job#' + job_id
var start = new Date();
 
var batchDocuments = new Array();
var index = 0;
var allTexts = ["I Love You","Docker","AWS","HyperLoop","Lambda Expression","Movies"];
var allUser = ["sasikumar.sugumar","balakumar.sugumar","nishanthi.sugumar","sugumar","vikram","bhaskar"];

 var textIndex = 0;
 var userIndex = 0;

 function getAllText(textIndexL) {
   return allTexts[textIndexL];
 }

 function getAllUser(textIndexL) {
   return allUser[textIndexL];
 }

while(index < documentNumber) {
    textIndex++;
    var date = new Date(minDate.getTime() + Math.random() * delta);
    var value = Math.random();
    var textValue = getAllText(textIndex);
    var userValue = getAllUser(textIndex);
   if(textIndex == 4){
       textIndex = 0;
   }

    var document = {
  postId: value,
  text: textValue,
  userId: userValue,
  bookMarks: [
    {
      userId: "sugumar",
      tags: [
        "Education",
        "Sports"
      ]
    },
    {
      userId: "nishanthi.sugumar",
      tags: [
        "Entertainment",
        "Technology"
      ]
    }
  ],
createdTime : date
};
    batchDocuments[index % batchNumber] = document;
    if((index + 1) % batchNumber == 0) {
        db.posts.insert(batchDocuments);
    }
    index++;
    if(index % 100000 == 0) {   
        print(job_name + ' inserted ' + index + ' documents.');
    }
}
print(job_name + ' inserted ' + documentNumber + ' in ' + (new Date() - start)/1000.0 + 's');
