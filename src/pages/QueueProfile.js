import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import emailjs from "emailjs-com";
import config from "../config";

const QueueProfile = () => {
  const { queueid, counterid, purposeid, windowid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState({});
  const [counters, setCounters] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [windows, setWindows] = useState([]);
  const [counter, setCounter] = useState({});

  const [selectedCounter, setSelectedCounter] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [selectedWindow, setSelectedWindow] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [statusWarning, setStatusWarning] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch queue
        const queueRes = await axios.get(
          `${config.API_BASE_URL}/api/queue/${queueid}`
        );
        const queueData = queueRes.data[0];
        setQueue(queueData);

        // Fetch counters
        const countersRes = await axios.get(
          `${config.API_BASE_URL}/api/counters/`
        );
        setCounters(countersRes.data);

        // Set counter
        const currentCounterId = queueData.Counter_ID || counterid;
        setSelectedCounter(currentCounterId);

        // Fetch purposes and windows for selected counter
        const purposesRes = await axios.get(
          `${config.API_BASE_URL}/api/purposes/${currentCounterId}`
        );
        setPurposes(purposesRes.data);

        const windowsRes = await axios.get(
          `${config.API_BASE_URL}/api/windows/${currentCounterId}`
        );
        setWindows(windowsRes.data);

        const CounterRes = await axios.get(
          `${config.API_BASE_URL}/api/counter/${currentCounterId}`
        );
        setCounter(CounterRes.data);

        // Set selected purpose and window
        setSelectedPurpose(queueData.Purpose_ID || purposeid);
        setSelectedWindow(queueData.Window_ID || windowid);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchInitialData();
  }, [queueid, counterid, purposeid, windowid]);

  const handleChangeOffice = async (event) => {
    const selected = event.target.value;
    setSelectedCounter(selected);

    setQueue((prev) => ({
      ...prev,
      Counter_ID: selected,
    }));

    try {
      const purposesRes = await axios.get(
        `${config.API_BASE_URL}/api/purposes/${selected}`
      );
      setPurposes(purposesRes.data);

      const windowsRes = await axios.get(
        `${config.API_BASE_URL}/api/windows/${selected}`
      );
      setWindows(windowsRes.data);

      const CounterRes = await axios.get(
        `${config.API_BASE_URL}/api/counter/${selected}`
      );
      setCounter(CounterRes.data);

      // Clear old selections when switching office
      setSelectedPurpose("");
      setSelectedWindow("");
    } catch (error) {
      console.error("Error fetching purposes or windows:", error);
    }
  };

  const handleChangePurpose = (event) => {
    const selected = event.target.value;

    setSelectedPurpose(selected);
    setQueue((prev) => ({
      ...prev,
      Purpose_ID: selected,
      Status: "TRANSFERRED",
      Assigned_Counter: counter[0].Assigned_Counter,
    }));
  };

  const handleChangeWindow = (event) => {
    const selected = event.target.value;
    setSelectedWindow(selected);
    setQueue((prev) => ({
      ...prev,
      Window_ID: selected,
      Status: "TRANSFERRED",
      Assigned_Counter: counter[0].Assigned_Counter,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(queue);

    if (selectedWindow !== "") {
      axios
        .put(`${config.API_BASE_URL}/api/put/queue/` + queueid, queue)
        .then(function (response) {
          console.log(response.data);
          if (response.data.errno) {
            setOpenWarning(true);
          } else {
            emailjs
              .send(
                "service_a44eotc", // Replace with your EmailJS Service ID
                "template_3rmgz2i", // Replace with your EmailJS Template ID
                {
                  Student_ID: queue.Student_ID,
                  Email_Address: queue.Email_Address,
                  Custom_Message: `Your queue has been TRANSFERRED kindly go to ${queue.Assigned_Counter.toUpperCase()}'S office at WINDOW ${
                    queue.Window_Number
                  }!`,
                },
                "JCUSScyWzhjLV0Xky" // Replace with your EmailJS Public Key
              )
              .then(
                (result) => {
                  console.log("Email sent successfully", result.text);
                },
                (error) => {
                  console.error("Error sending email", error.text);
                }
              );

            setOpenSuccess(true);
            navigate("/queuelist");
          }
        });
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 5 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 3,
          mt: 4,
          mb: 4,
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
          Transfer Queue
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="counter-label">Office</InputLabel>
            <Select
              sx={{ textAlign: "left" }}
              value={selectedCounter}
              onChange={handleChangeOffice}
              label="Office"
            >
              {counters.map((counter) => (
                <MenuItem key={counter.Counter_ID} value={counter.Counter_ID}>
                  {counter.Assigned_Counter.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="purpose-label">Purpose</InputLabel>
            <Select
              sx={{ textAlign: "left" }}
              value={selectedPurpose}
              onChange={handleChangePurpose}
              label="Purpose"
            >
              {purposes.map((purpose) => (
                <MenuItem key={purpose.Purpose_ID} value={purpose.Purpose_ID}>
                  {purpose.Purpose_Description.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="window-label">Window</InputLabel>
            <Select
              sx={{ textAlign: "left" }}
              value={selectedWindow}
              onChange={handleChangeWindow}
              label="Window"
            >
              {windows.map((window) => (
                <MenuItem key={window.Window_ID} value={window.Window_ID}>
                  WINDOW {window.Window_Number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={4}>
              {user?.Role === "student" && (
                <Link to="/queuelist" style={{ textDecoration: "none" }}>
                  <Button fullWidth variant="contained">
                    Cancel
                  </Button>
                </Link>
              )}
            </Grid>
            <Grid item xs={8}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="success"
              >
                Transfer Queue
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar
        open={openSuccess}
        autoHideDuration={3000}
        onClose={() => setOpenSuccess(false)}
      >
        <Alert severity="success" onClose={() => setOpenSuccess(false)}>
          Updated Queue
        </Alert>
      </Snackbar>

      <Snackbar
        open={openWarning}
        autoHideDuration={5000}
        onClose={() => setOpenWarning(false)}
      >
        <Alert severity="warning" onClose={() => setOpenWarning(false)}>
          Queue ID is already used
        </Alert>
      </Snackbar>

      <Snackbar
        open={statusWarning}
        autoHideDuration={5000}
        onClose={() => setStatusWarning(false)}
      >
        <Alert severity="warning" onClose={() => setStatusWarning(false)}>
          Queue is {queue.Status}.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default QueueProfile;
