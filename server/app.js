const express = require("express");
const db = require("./db");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
const port = 4000;

////////////////////////////////////////////////////////////////////////////////// USER

app.get("/api/users", (req, res) => {
  const query = "SELECT * FROM tbluser";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.get("/api/user/:Staff_ID", (req, res) => {
  const query =
    "SELECT * FROM tbluser WHERE User_Type_ID='" + req.params.Staff_ID + "'";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.get("/api/user/:User_ID/:Role", (req, res) => {
  if (req.params.Role === "staff" || req.params.Role === "administrator") {
    db.query(
      "SELECT * FROM tbluser, tblstaff, tblcounter WHERE tbluser.User_Type_ID=tblstaff.Staff_ID AND tblstaff.Counter_ID=tblcounter.Counter_ID AND tbluser.User_ID='" +
        req.params.User_ID +
        "'",
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Database query failed");
        }
        res.json(results);
      }
    );
  } else {
    db.query(
      "SELECT * FROM tbluser, tblstudent WHERE tbluser.User_Type_ID=tblstudent.Student_ID AND tbluser.User_ID='" +
        req.params.User_ID +
        "'",
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Database query failed");
        }
        res.json(results);
      }
    );
  }
});

app.post("/api/post/user/staff/:Staff_ID", (req, res) => {
  db.query(
    "INSERT INTO `tbluser`(`Username`, `Password`, `Role`, `User_Type_ID`) VALUES ('" +
      req.body.Username +
      "','" +
      req.body.Password +
      "','staff','" +
      req.params.Staff_ID +
      "')",
    function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    }
  );
  res.send("Data Inserted!");
});

app.post("/api/post/user/student", (req, res) => {
  db.query(
    "INSERT INTO `tbluser`(`Username`, `Password`, `Role`, `User_Type_ID`) VALUES ('" +
      req.body.Student_ID +
      "','" +
      req.body.Password +
      "','student','" +
      req.body.Student_ID +
      "')",
    function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    }
  );
  res.send("Data Inserted!");
});

app.put("/api/put/user/staff/:User_Type_ID", (req, res) => {
  db.query(
    "UPDATE tbluser SET Username ='" +
      req.body.Username +
      "', Password ='" +
      req.body.Password +
      "' WHERE User_Type_ID = '" +
      req.params.User_Type_ID +
      "' ",
    (err, result) => {
      if (err) {
        res.status(500).send({ error: err.message });
      } else {
        res.status(200).send({ message: "User updated successfully", result });
      }
    }
  );
});

app.put("/api/put/user/student/:Student_ID", (req, res) => {
  db.query(
    "UPDATE tbluser SET Password ='" +
      req.body.Password +
      "' WHERE User_Type_ID = '" +
      req.params.Student_ID +
      "' ",
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

////////////////////////////////////////////////////////////////////////////////// STAFF

app.get("/api/staffs", (req, res) => {
  const query =
    "SELECT  tblstaff.*,  tblwindow.*,  tblcounter.*, tblcounter.Assigned_Counter AS Office FROM tblstaff LEFT JOIN tblwindow ON tblstaff.Window_ID = tblwindow.Window_ID LEFT JOIN tblcounter ON tblstaff.Counter_ID = tblcounter.Counter_ID";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.get("/api/staffs/:Counter_ID/:Staff_ID", (req, res) => {
  const query =
    "SELECT tblstaff.*, tblwindow.*, tblcounter.*,tblcounter.Assigned_Counter AS Office FROM tblstaff LEFT JOIN tblwindow ON tblstaff.Window_ID = tblwindow.Window_ID LEFT JOIN tblcounter ON tblstaff.Counter_ID = tblcounter.Counter_ID WHERE tblcounter.Counter_ID = '" +
    req.params.Counter_ID +
    "' AND tblstaff.Staff_ID != '" +
    req.params.Staff_ID +
    "'";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.get("/api/staff/:Staff_ID", (req, res) => {
  const query =
    "SELECT tblstaff.*, tblwindow.*, tblcounter.* FROM tblstaff LEFT JOIN tblwindow ON tblstaff.Window_ID = tblwindow.Window_ID LEFT JOIN tblcounter ON tblstaff.Counter_ID = tblcounter.Counter_ID WHERE Staff_ID ='" +
    req.params.Staff_ID +
    "'";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.get("/api/staff/window/:Window_ID", (req, res) => {
  const query =
    "SELECT * FROM tblstaff WHERE Window_ID ='" + req.params.Window_ID + "'";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.post("/api/post/staff", function (req, res) {
  db.query(
    "INSERT INTO `tblstaff`(`Staff_Last_Name`, `Staff_First_Name`, `Staff_Middle_Name`, `Staff_Email_Address`, `Staff_Position`, `Counter_ID`, `Queue_Limit`, `Window_ID`) VALUES ('" +
      req.body.Staff_Last_Name +
      "','" +
      req.body.Staff_First_Name +
      "','" +
      req.body.Staff_Middle_Name +
      "','" +
      req.body.Staff_Email_Address +
      "','" +
      req.body.Staff_Position +
      "','" +
      req.body.Counter_ID +
      "','" +
      req.body.Queue_Limit +
      "','" +
      req.body.Window_ID +
      "')",
    function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    }
  );
  res.send("Data Inserted!");
});

app.delete("/api/delete/staff/:Staff_ID", (req, res) => {
  db.query(
    "DELETE FROM tblstaff WHERE Staff_ID = ?",
    req.params.Staff_ID,
    (err, result) => {
      if (err) {
        console.error("Error deleting staff from tblstaff:", err);
        return res
          .status(500)
          .json({ message: "Error deleting staff from tblstaff" });
      }

      // If no rows were affected, staff was not found
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Staff not found in tblstaff" });
      }

      // Proceed to delete from tbluser
      db.query(
        "DELETE FROM tbluser WHERE User_Type_ID = ?",
        req.params.Staff_ID,
        (err2, result2) => {
          if (err2) {
            console.error("Error deleting staff from tbluser:", err2);
            return res
              .status(500)
              .json({ message: "Error deleting staff from tbluser" });
          }

          res.json({ message: "Staff deleted successfully from both tables" });
        }
      );
    }
  );
});

app.put("/api/put/staff/:Staff_ID", (req, res) => {
  db.query(
    "UPDATE tblstaff SET Staff_Last_Name ='" +
      req.body.Staff_Last_Name +
      "',Staff_First_Name ='" +
      req.body.Staff_First_Name +
      "', Staff_Middle_Name ='" +
      req.body.Staff_Middle_Name +
      "', Staff_Email_Address ='" +
      req.body.Staff_Email_Address +
      "', Staff_Position ='" +
      req.body.Staff_Position +
      "', Counter_ID ='" +
      req.body.Counter_ID +
      "', Window_ID ='" +
      req.body.Window_ID +
      "', Queue_Limit ='" +
      req.body.Queue_Limit +
      "' WHERE Staff_ID = '" +
      req.params.Staff_ID +
      "' ",
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

////////////////////////////////////////////////////////////////////////////////// STUDENT

app.get("/api/students", (req, res) => {
  const query =
    "SELECT * FROM tblstudent, tblcourse WHERE tblstudent.Course_ID=tblcourse.Course_ID";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.get("/api/student/:Student_ID", (req, res) => {
  const query =
    "SELECT * FROM tblstudent, tblcourse WHERE tblstudent.Course_ID=tblcourse.Course_ID AND Student_ID='" +
    req.params.Student_ID +
    "'";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.post("/api/post/student", function (req, res) {
  db.query(
    "INSERT INTO `tblstudent`(`Student_ID`, `Last_Name`, `First_Name`, `Middle_Name`, `Phone_Number`, `Email_Address`, `Person_Category`, `Course_ID`) VALUES ('" +
      req.body.Student_ID +
      "','" +
      req.body.Last_Name +
      "','" +
      req.body.First_Name +
      "','" +
      req.body.Middle_Name +
      "','" +
      req.body.Phone_Number +
      "','" +
      req.body.Email_Address +
      "','" +
      req.body.Person_Category +
      "','" +
      req.body.Course_ID +
      "')",
    function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    }
  );
  res.send("Data Inserted!");
});

app.put("/api/put/student/:Student_ID", (req, res) => {
  db.query(
    "UPDATE tblstudent SET Student_ID ='" +
      req.body.Student_ID +
      "', Last_Name ='" +
      req.body.Last_Name +
      "',First_Name ='" +
      req.body.First_Name +
      "', Middle_Name ='" +
      req.body.Middle_Name +
      "', Phone_Number ='" +
      req.body.Phone_Number +
      "', Email_Address ='" +
      req.body.Email_Address +
      "', Person_Category ='" +
      req.body.Person_Category +
      "', Course_ID ='" +
      req.body.Course_ID +
      "' WHERE Student_ID = '" +
      req.params.Student_ID +
      "' ",
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/api/delete/student/:Student_ID", (req, res) => {
  db.query(
    "DELETE FROM tblstudent WHERE Student_ID = ?",
    req.params.Student_ID,
    (err, result) => {
      if (err) {
        console.error("Error deleting student from tblstudent:", err);
        return res
          .status(500)
          .json({ message: "Error deleting student from tblstudent" });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Student not found in tblstudent" });
      }

      // Now delete from tbluser
      db.query(
        "DELETE FROM tbluser WHERE User_Type_ID = ?",
        req.params.Student_ID,
        (err2, result2) => {
          if (err2) {
            console.error("Error deleting student from tbluser:", err2);
            return res
              .status(500)
              .json({ message: "Error deleting student from tbluser" });
          }

          // Optional: Check result2.affectedRows if needed
          res.json({
            message: "Student deleted successfully from both tables",
          });
        }
      );
    }
  );
});

////////////////////////////////////////////////////////////////////////////////// QUEUE

app.get("/api/dashboard/:Counter_ID/:Status", (req, res) => {
  db.query(
    "SELECT * FROM tblqueue JOIN tblwindow ON tblqueue.Window_ID = tblwindow.Window_ID JOIN tblcounter ON tblwindow.Counter_ID = tblcounter.Counter_ID JOIN tblstudent ON tblqueue.Student_ID = tblstudent.Student_ID WHERE tblwindow.Counter_ID='" +
      req.params.Counter_ID +
      "' AND tblqueue.Status='" +
      req.params.Status +
      "' ORDER BY CASE WHEN tblqueue.Status = 'In Progress' THEN 1 WHEN tblqueue.Status = 'Waiting' THEN 2 WHEN tblqueue.Status = 'Completed' THEN 3 WHEN tblqueue.Status = 'Cancelled' THEN 4 ELSE 5 END, CASE WHEN tblstudent.Person_Category = 'Person With Disability' THEN 1 WHEN tblstudent.Person_Category = 'Pregnant' THEN 2 ELSE 3 END, Start_Time ASC",
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Database query failed");
      }
      res.json(results);
    }
  );
});

app.get("/api/queuelist/minidasboard/:Window_ID/:Status", (req, res) => {
  db.query(
    "SELECT * FROM tblqueue JOIN tblwindow ON tblqueue.Window_ID = tblwindow.Window_ID JOIN tblcounter ON tblwindow.Counter_ID = tblcounter.Counter_ID JOIN tblstudent ON tblqueue.Student_ID = tblstudent.Student_ID WHERE tblwindow.Window_ID='" +
      req.params.Window_ID +
      "' AND tblqueue.Status='" +
      req.params.Status +
      "' ORDER BY CASE WHEN tblqueue.Status = 'In Progress' THEN 1 WHEN tblqueue.Status = 'Waiting' THEN 2 WHEN tblqueue.Status = 'Completed' THEN 3 WHEN tblqueue.Status = 'Cancelled' THEN 4 ELSE 5 END, CASE WHEN tblstudent.Person_Category = 'Person With Disability' THEN 1 WHEN tblstudent.Person_Category = 'Pregnant' THEN 2 ELSE 3 END, Start_Time ASC",
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Database query failed");
      }
      res.json(results);
    }
  );
});

app.get("/api/queuelist/staff/:Counter_ID", (req, res) => {
  db.query(
    "SELECT * FROM tblqueue JOIN tblpurpose ON tblqueue.Purpose_ID = tblpurpose.Purpose_ID JOIN tblcounter ON tblpurpose.Counter_ID = tblcounter.Counter_ID JOIN tblstudent ON tblqueue.Student_ID = tblstudent.Student_ID JOIN tblcourse ON tblcourse.Course_ID = tblstudent.Course_ID WHERE tblpurpose.Counter_ID='" +
      req.params.Counter_ID +
      "' ORDER BY CASE WHEN tblqueue.Status = 'In Progress' THEN 1 WHEN tblqueue.Status = 'Waiting' THEN 2 WHEN tblqueue.Status = 'Completed' THEN 3 WHEN tblqueue.Status = 'Cancelled' THEN 4 ELSE 5 END, CASE WHEN tblstudent.Person_Category = 'Person With Disability' THEN 1 WHEN tblstudent.Person_Category = 'Pregnant' THEN 2 ELSE 3 END, Start_Time ASC",
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Database query failed");
      }
      res.json(results);
    }
  );
});

app.get("/api/queuelist/staff/window/:Window_ID", (req, res) => {
  db.query(
    "SELECT * FROM tblqueue JOIN tblpurpose ON tblqueue.Purpose_ID = tblpurpose.Purpose_ID JOIN tblwindow ON tblqueue.Window_ID = tblwindow.Window_ID JOIN tblcounter ON tblwindow.Counter_ID = tblcounter.Counter_ID JOIN tblstudent ON tblqueue.Student_ID = tblstudent.Student_ID JOIN tblcourse ON tblcourse.Course_ID = tblstudent.Course_ID WHERE tblqueue.Window_ID='" +
      req.params.Window_ID +
      "' ORDER BY CASE WHEN tblqueue.Status = 'In Progress' THEN 1 WHEN tblqueue.Status = 'Waiting' THEN 2 WHEN tblqueue.Status = 'Completed' THEN 3 WHEN tblqueue.Status = 'Cancelled' THEN 4 ELSE 5 END, CASE WHEN tblstudent.Person_Category = 'Person With Disability' THEN 1 WHEN tblstudent.Person_Category = 'Pregnant' THEN 2 ELSE 3 END, Start_Time ASC",
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Database query failed");
      }
      res.json(results);
    }
  );
});

app.get("/api/queuelist/student/:Student_ID", (req, res) => {
  db.query(
    "SELECT *, tblqueue.Window_ID AS Window_ID FROM tblqueue JOIN tblpurpose ON tblqueue.Purpose_ID = tblpurpose.Purpose_ID JOIN tblwindow ON tblqueue.Window_ID = tblwindow.Window_ID JOIN tblcounter ON tblpurpose.Counter_ID = tblcounter.Counter_ID JOIN tblstudent ON tblqueue.Student_ID = tblstudent.Student_ID JOIN tblcourse ON tblcourse.Course_ID = tblstudent.Course_ID WHERE tblstudent.Student_ID='" +
      req.params.Student_ID +
      "'  ORDER BY CASE WHEN tblqueue.Status = 'In Progress' THEN 1 WHEN tblqueue.Status = 'Waiting' THEN 2 WHEN tblqueue.Status = 'Completed' THEN 3 WHEN tblqueue.Status = 'Cancelled' THEN 4 ELSE 5 END, Start_Time ASC",
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Database query failed");
      }
      res.json(results);
    }
  );
});

app.get("/api/queuelist/administrator", (req, res) => {
  db.query(
    "SELECT * FROM tblqueue JOIN tblpurpose ON tblqueue.Purpose_ID = tblpurpose.Purpose_ID JOIN tblcounter ON tblpurpose.Counter_ID = tblcounter.Counter_ID JOIN tblstudent ON tblqueue.Student_ID = tblstudent.Student_ID JOIN tblcourse ON tblcourse.Course_ID = tblstudent.Course_ID ORDER BY CASE WHEN tblqueue.Status = 'In Progress' THEN 1 WHEN tblqueue.Status = 'Waiting' THEN 2 WHEN tblqueue.Status = 'Completed' THEN 3 WHEN tblqueue.Status = 'Cancelled' THEN 4 ELSE 5 END, CASE WHEN tblstudent.Person_Category = 'Person With Disability' THEN 1 WHEN tblstudent.Person_Category = 'Pregnant' THEN 2 ELSE 3 END, Start_Time ASC",
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Database query failed");
      }
      res.json(results);
    }
  );
});

app.get(
  "/api/queuelist/purpose/:Purpose_ID/:Start_Time/:Status",
  (req, res) => {
    db.query(
      "SELECT * FROM tblqueue WHERE Purpose_ID='" +
        req.params.Purpose_ID +
        "' AND DATE(Start_Time)='" +
        req.params.Start_Time +
        "' AND Status='" +
        req.params.Status +
        "'",
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Database query failed");
        }
        res.json(results);
      }
    );
  }
);

app.get("/api/queuelist/:Window_ID/:Start_Time", (req, res) => {
  db.query(
    "SELECT * FROM tblqueue WHERE Window_ID='" +
      req.params.Window_ID +
      "' AND DATE(Start_Time)='" +
      req.params.Start_Time +
      "'",
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Database query failed");
      }
      res.json(results);
    }
  );
});

app.get("/api/queue/:Queue_ID", (req, res) => {
  const query =
    "SELECT *, tblqueue.Window_ID AS Window_ID FROM tblqueue, tblwindow, tblcounter, tblpurpose, tblstudent WHERE tblqueue.Window_ID=tblwindow.Window_ID AND tblwindow.Counter_ID=tblcounter.Counter_ID AND tblqueue.Purpose_ID=tblpurpose.Purpose_ID AND tblqueue.Student_ID=tblstudent.Student_ID AND Queue_ID='" +
    req.params.Queue_ID +
    "'";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.post("/api/post/queue", function (req, res) {
  db.query(
    "INSERT INTO tblqueue (Student_ID, Purpose_ID, Window_ID, Status) VALUES ('" +
      req.body.Student_ID +
      "','" +
      req.body.Purpose_ID +
      "','" +
      req.body.Window_ID +
      "','" +
      req.body.Status +
      "')",
    function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    }
  );
  res.send("Data Inserted!");
});

app.put("/api/put/queue/:Queue_ID", (req, res) => {
  db.query(
    "UPDATE tblqueue SET Purpose_ID ='" +
      req.body.Purpose_ID +
      "', Window_ID ='" +
      req.body.Window_ID +
      "' WHERE Queue_ID = '" +
      req.params.Queue_ID +
      "' ",
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.get("/api/data", (req, res) => {
  const { param1, param2 } = req.query; // Extract query parameters
  res.json({ message: `Received ${param1} and ${param2}` });
});

app.put("/api/put/status/", (req, res) => {
  if (req.body.Status === "Waiting") {
    db.query(
      "UPDATE tblqueue SET Status ='" +
        req.body.Status +
        "', Remarks ='" +
        req.body.Remarks +
        "', Staff_ID ='" +
        req.body.Staff_ID +
        "', Start_Time = CURRENT_TIMESTAMP, End_Time=NULL WHERE Queue_ID = '" +
        req.body.Queue_ID +
        "' ",
      (err, result) => {
        if (err) {
          res.send(err);
        } else {
          res.send(result);
        }
      }
    );
  } else {
    db.query(
      "UPDATE tblqueue SET Status ='" +
        req.body.Status +
        "', Remarks ='" +
        req.body.Remarks +
        "', Staff_ID ='" +
        req.body.Staff_ID +
        "', End_Time = CURRENT_TIMESTAMP WHERE Queue_ID = '" +
        req.body.Queue_ID +
        "' ",
      (err, result) => {
        if (err) {
          res.send(err);
        } else {
          res.send(result);
        }
      }
    );
  }
});

app.delete("/api/delete/queue/:Queue_ID", (req, res) => {
  db.query(
    "DELETE FROM tblqueue WHERE Queue_ID = '" + req.params.Queue_ID + "'",
    (err, result) => {
      if (err) {
        console.error("Error deleting student:", err);
        return res.status(500).json({ message: "Error deleting queue" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Queue not found" });
      }

      res.json({ message: "Queue deleted successfully" });
    }
  );
});

////////////////////////////////////////////////////////////////////////////////// ASSIGNED COUNTER

app.get("/api/counters", (req, res) => {
  const query = "SELECT * FROM tblcounter";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.get("/api/counter/:Counter_ID", (req, res) => {
  const query =
    "SELECT * FROM tblcounter WHERE Counter_ID='" + req.params.Counter_ID + "'";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.post("/api/post/counter", function (req, res) {
  db.query(
    "INSERT INTO tblcounter (Assigned_Counter) VALUES ('" +
      req.body.Assigned_Counter +
      "')",
    function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    }
  );
  res.send("Data Inserted!");
});

app.put("/api/put/counter/:Counter_ID", (req, res) => {
  db.query(
    "UPDATE tblcounter SET Assigned_Counter ='" +
      req.body.Assigned_Counter +
      "' WHERE Counter_ID = '" +
      req.params.Counter_ID +
      "' ",
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/api/delete/counter/:Counter_ID", (req, res) => {
  db.query(
    "DELETE FROM tblcounter WHERE Counter_ID = '" + req.params.Counter_ID + "'",
    (err, result) => {
      if (err) {
        console.error("Error deleting office:", err);
        return res.status(500).json({ message: "Error deleting office" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Office not found" });
      }

      res.json({ message: "Office deleted successfully" });
    }
  );
});

////////////////////////////////////////////////////////////////////////////////// WINDOW

app.get("/api/windows", (req, res) => {
  const query =
    "SELECT * FROM tblwindow, tblcounter WHERE tblwindow.Counter_ID=tblcounter.Counter_ID";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.get("/api/window/:Counter_ID", (req, res) => {
  const query =
    "SELECT * FROM tblwindow, tblcounter WHERE tblwindow.Counter_ID=tblcounter.Counter_ID AND tblcounter.Counter_ID='" +
    req.params.Counter_ID +
    "'";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.get("/api/windows/:Counter_ID", (req, res) => {
  const query = `
    SELECT * FROM tblwindow JOIN tblcounter ON tblwindow.Counter_ID = tblcounter.Counter_ID WHERE tblwindow.Counter_ID = ? AND tblwindow.Window_Number IS NOT NULL AND tblwindow.Window_Number != ''
  `;
  const values = [req.params.Counter_ID];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Database query failed:", err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.post("/api/post/window", function (req, res) {
  db.query(
    "INSERT INTO tblwindow (Window_Number, Counter_ID) VALUES ('" +
      req.body.Window_Number +
      "', '" +
      req.body.Counter_ID +
      "')",
    function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    }
  );
  res.send("Data Inserted!");
});

app.delete("/api/delete/window/:Window_ID", (req, res) => {
  db.query(
    "DELETE FROM tblwindow WHERE Window_ID = '" + req.params.Window_ID + "'",
    (err, result) => {
      if (err) {
        console.error("Error deleting window:", err);
        return res.status(500).json({ message: "Error deleting window" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Window not found" });
      }

      res.json({ message: "Window deleted successfully" });
    }
  );
});

////////////////////////////////////////////////////////////////////////////////// COURSE

app.get("/api/courses", (req, res) => {
  const query = "SELECT * FROM tblcourse";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.get("/api/course/:Course_ID", (req, res) => {
  const query =
    "SELECT * FROM tblcourse WHERE Course_ID='" + req.params.Course_ID + "'";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.post("/api/post/course", function (req, res) {
  db.query(
    "INSERT INTO tblcourse (Course_Code, Course_Description, Course_Major, Window_ID) VALUES ('" +
      req.body.Course_Code +
      "', '" +
      req.body.Course_Description +
      "', '" +
      req.body.Course_Major +
      "', '" +
      req.body.Window_ID +
      "')",
    function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    }
  );
  res.send("Data Inserted!");
});

app.put("/api/put/course/:Course_ID", (req, res) => {
  db.query(
    "UPDATE tblcourse SET Course_Code ='" +
      req.body.Course_Code +
      "' , Course_Description='" +
      req.body.Course_Description +
      "', Course_Major='" +
      req.body.Course_Major +
      "', Window_ID='" +
      req.body.Window_ID +
      "' WHERE Course_ID = '" +
      req.params.Course_ID +
      "' ",
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/api/delete/course/:Course_ID", (req, res) => {
  db.query(
    "DELETE FROM tblcourse WHERE Course_ID = '" + req.params.Course_ID + "'",
    (err, result) => {
      if (err) {
        console.error("Error deleting course:", err);
        return res.status(500).json({ message: "Error deleting course" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "course not found" });
      }

      res.json({ message: "Course deleted successfully" });
    }
  );
});

////////////////////////////////////////////////////////////////////////////////// PURPOSE

app.get("/api/purposes", (req, res) => {
  const query = "SELECT * FROM tblpurpose ";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.get("/api/purposes/:Counter_ID", (req, res) => {
  const query =
    "SELECT * FROM tblpurpose WHERE Counter_ID='" + req.params.Counter_ID + "'";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.get("/api/purpose/:Purpose_ID", (req, res) => {
  const query =
    "SELECT * FROM tblpurpose, tblcounter WHERE tblpurpose.Counter_ID=tblcounter.Counter_ID AND Purpose_ID='" +
    req.params.Purpose_ID +
    "'";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database query failed");
    }
    res.json(results);
  });
});

app.post("/api/post/purpose", function (req, res) {
  db.query(
    "INSERT INTO tblpurpose (Purpose_Description, Purpose_Type, Counter_ID, Window_ID) VALUES ('" +
      req.body.Purpose_Description +
      "', '" +
      req.body.Purpose_Type +
      "', '" +
      req.body.Counter_ID +
      "', '" +
      req.body.Window_ID +
      "')",
    function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    }
  );
  res.send("Data Inserted!");
});

app.put("/api/put/purpose/:Purpose_ID", (req, res) => {
  db.query(
    "UPDATE tblpurpose SET Purpose_Description ='" +
      req.body.Purpose_Description +
      "' , Purpose_Type='" +
      req.body.Purpose_Type +
      "', Window_ID='" +
      req.body.Window_ID +
      "' WHERE Purpose_ID = '" +
      req.params.Purpose_ID +
      "' ",
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/api/delete/purpose/:Purpose_ID", (req, res) => {
  db.query(
    "DELETE FROM tblpurpose WHERE Purpose_ID = '" + req.params.Purpose_ID + "'",
    (err, result) => {
      if (err) {
        console.error("Error deleting purpose:", err);
        return res.status(500).json({ message: "Error deleting purpose" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "purpose not found" });
      }

      res.json({ message: "Course deleted successfully" });
    }
  );
});

//////////////////////////////////////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
