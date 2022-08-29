var oracledb = require('oracledb');

function CategoryFn() {
    var chosenCategory = document.getElementById("category").value;
    if (chosenCategory === "1") {
        document.getElementById("designation").style.display = "none";
        document.getElementById("batch").style.display = "block";
    }
    else if (chosenCategory === "2" || chosenCategory === "3" || chosenCategory === "4" || chosenCategory === "5" || chosenCategory === "6" || chosenCategory === "7" || chosenCategory === "8" || chosenCategory === "9" || chosenCategory === "10") {
        document.getElementById("batch").style.display = "none";
        document.getElementById("designation").style.display = "block";
    }
    else {
        document.getElementById("batch").style.display = "none";
        document.getElementById("designation").style.display = "none";
    }
}

function defaultFn() {
    document.getElementById("batch").style.display = "none";
    document.getElementById("designation").style.display = "none";
}



function Send_Email() {
    let categorycheck = document.getElementById("category").value;
    let batchcheck = document.getElementById("batch").value;
    let designationcheck = document.getElementById("designation").value;
    let departmentcheck = document.getElementById("department").value;
    let emailtocheck = document.getElementById("emailto").value;
    let subjectcheck = document.getElementById("subject").value;
    var generatelogsvalue = $("input[name='generatelogs']:checked").val();
    if (emailtocheck === "") {
        alert("Please enter to email addresses!");
    }
    else if (departmentcheck === " ") {
        alert("Please make the right selection!");
    }
    else if (subjectcheck === "") {
        alert("Please enter subject!");
    }
    else if (generatelogsvalue === undefined) {
        alert("Please select the value for generate logs");
    }
    else {
        alert("Email sent successfully!");
        var generatelogsvalue = $("input[name='generatelogs']:checked").val();
        const userRequest = new XMLHttpRequest();
        userRequest.open('post', '/insertData');
        userRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
        userRequest.send(JSON.stringify({ 'Toemail': $('#emailto').val(), 'Database': $('#databases').val(), 'Category': $('#category').val(), 'Batch': $('#batch').val(), 'Designation': $('#designation').val(), 'Department': $('#department').val(), 'CCemail': $('#emailCC').val(), 'Subject': $('#subject').val(), 'BodyText': $('#email_template').summernote('code'), 'Generatelogs': generatelogsvalue, }));
        //   alert("Email Sent Successfully!");


        let formData = new FormData();

        const to = $('#emailto').val();
        const databases = $('#databases').val();
        const category = $('#category').val();
        const batch = $('#batch').val();
        const designation = $('#designation').val();
        const department = $('#department').val();
        const lost = $('#lost').val();
        const loaned = $('#loaned').val();
        const cc = $('#emailCC').val();
        const bcc = $('#emailbcc').val();
        const subject = $('#subject').val();
        const body = $('#email_template').summernote('code');
        const attachmentlist = $('#email_attachments').get(0).dropzone;
        const files = attachmentlist.files;
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        const emailobject = {
            emailto: to,
            emailcc: cc,
            emailbcc: bcc,
            subject: subject,
            body: body,
            databases: databases,
            category: category,
            batch: batch,
            designation: designation,
            department: department,
            generatelogsvalue: generatelogsvalue
        }
        formData.append('emailobject', JSON.stringify(emailobject));
        $.ajax({
            url: '/sendemail',
            type: 'POST',
            datatype: 'json',
            processData: false,
            contentType: false,
            data: formData,
            success: (response) => {
                console.log(response);
            },
            error: (error) => {
                console.log(error.message);
            }
        })
    }
}