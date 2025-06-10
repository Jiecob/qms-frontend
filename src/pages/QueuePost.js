import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  Grid2,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import config from "../config";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

const QueuePost = () => {
  const { user } = useAuth();
  const { id } = useParams();

  const today = format(new Date(), "yyyy-MM-dd");
  // console.log(today);

  // console.log(id);

  const navigate = useNavigate();

  const [queue, setQueue] = useState({
    Student_ID: id,
    Status: "Waiting",
    Assigned_Counter: "",
    Purpose_ID: "",
    Window_ID: "",
  });
  const [counter, setCounter] = useState([]);
  const [counters, setCounters] = useState([]);
  const [purposes, setPurposes] = useState([]);

  const [selectedCounter, setSelectedCounter] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");

  const [queues, setQueues] = useState([]);

  const [queuesLength, setQueuesLength] = useState("");

  const [queuesLimit, setQueuesLimit] = useState("");

  const [windows, setWindows] = useState([]);

  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/queuelist/student/${id}`)
      .then(function (response) {
        // console.log(response.data);
        setQueues(response.data);
      });
  }, []);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/counters/`).then(function (response) {
      // console.log(response.data);
      setCounters(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/windows`).then(function (response) {
      // console.log(response.data);
      setWindows(response.data);
    });
  }, []);

  const foundDuplicate = queues.find((obj) => {
    return (
      format(new Date(obj.Start_Time), "yyyy-MM-dd") ===
        format(new Date(), "yyyy-MM-dd") &&
      obj.Student_ID === queue.Student_ID &&
      obj.Purpose_ID == queue.Purpose_ID
    );
  });

  const handleChangeOffice = (event) => {
    const selected = event.target.value;
    setSelectedCounter(selected);
    setSelectedPurpose("");
    // console.log(selected);

    setQueue({
      Student_ID: id,
      Status: "Waiting",
      Counter_ID: selected,
      Purpose_ID: "",
      Window_ID: "",
    });

    axios
      .get(`${config.API_BASE_URL}/api/purposes/${selected}`)
      .then((response) => {
        setPurposes(response.data);
        // setWindows([]); // reset windows
      });

    axios
      .get(`${config.API_BASE_URL}/api/windows/${selected}`)
      .then((response) => {
        setWindows(response.data);
      });
  };

  const handleChangePurpose = (event) => {
    const selected = event.target.value;
    setSelectedPurpose(selected);

    axios
      .get(`${config.API_BASE_URL}/api/purpose/` + selected)
      .then(function (response) {
        // console.log(response.data);

        if (response.data[0].Window_ID > 0) {
          setQueue((prev) => ({
            ...prev,
            Purpose_ID: selected,
            Window_ID: response.data[0].Window_ID,
          }));
        } else {
          axios
            .get(`${config.API_BASE_URL}/api/student/` + id)
            .then(function (response) {
              // console.log(response.data);

              if (selectedCounter == 3) {
                setQueue((prev) => ({
                  ...prev,
                  Purpose_ID: selected,
                  Window_ID: response.data[0].Window_ID,
                }));
              } else {
                setQueue((prev) => ({
                  ...prev,
                  Purpose_ID: selected,
                }));
              }
            });
        }
      });
  };

  const handleChangeWindow = (event) => {
    const selected = event.target.value;
    setQueue((prev) => ({
      ...prev,
      Window_ID: selected,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (foundDuplicate) {
      setError("Duplicate Entry for today!");
      return;
    }

    if (!queue.Window_ID) return;

    try {
      // Fetch current queue count and staff queue limit
      const [queueRes, staffRes] = await Promise.all([
        axios.get(
          `${config.API_BASE_URL}/api/queuelist/${queue.Window_ID}/${today}`
        ),
        axios.get(`${config.API_BASE_URL}/api/staff/window/${queue.Window_ID}`),
      ]);

      const queuesLength = queueRes.data.length;
      const queueLimit = staffRes.data[0]?.Queue_Limit ?? 0;

      // console.log(queueLimit + " " + queuesLength);

      if (queuesLength > queueLimit) {
        setError(
          "Your queue is above the staff's limit. Please try again tomorrow!"
        );
        return;
      }

      // If under limit, proceed to submit the queue
      await axios.post(`${config.API_BASE_URL}/api/post/queue`, queue);
      navigate("/queuelist");
    } catch (error) {
      console.error("Submission error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          marginTop: 4,
          marginBottom: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={"bold"}
          align="center"
          color="#424242"
          gutterBottom
        >
          Add Queue
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="counter-label">Office</InputLabel>
            <Select
              name="Counter_ID"
              label="Counter"
              value={selectedCounter}
              onChange={handleChangeOffice}
              sx={{ textAlign: "left" }}
              MenuProps={{
                PaperProps: { sx: { textAlign: "left" } },
              }}
            >
              {counters.map((counter, index) => (
                <MenuItem key={index} value={counter.Counter_ID}>
                  {counter.Assigned_Counter.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" disabled={!selectedCounter}>
            <InputLabel id="purpose-label">Transaction</InputLabel>
            <Select
              name="Purpose_ID"
              label="Transaction"
              value={queue.Purpose_ID}
              onChange={handleChangePurpose}
              sx={{ textAlign: "left" }}
              MenuProps={{
                PaperProps: { sx: { textAlign: "left" } },
              }}
            >
              {purposes.map((purpose, index) => (
                <MenuItem key={index} value={String(purpose.Purpose_ID)}>
                  {purpose.Purpose_Description.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!queue.Window_ID && (
            <FormControl fullWidth margin="normal" disabled={!selectedPurpose}>
              <InputLabel id="window-label">Window</InputLabel>
              <Select
                name="Window_ID"
                label="Window"
                value={queue.Window_ID}
                onChange={handleChangeWindow}
                sx={{ textAlign: "left" }}
                MenuProps={{
                  PaperProps: { sx: { textAlign: "left" } },
                }}
              >
                {windows.map((window, index) => (
                  <MenuItem key={index} value={window.Window_ID}>
                    {"WINDOW " + window.Window_Number}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {error && (
            <Typography sx={{ mt: 1 }} variant="h6" align="center" color="red">
              {error}
            </Typography>
          )}

          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <Link
                to="/queuelist"
                style={{ textDecoration: "none", color: "black" }}
              >
                <Button variant="contained" sx={{ mt: 2, mb: 2 }}>
                  Cancel
                </Button>
              </Link>
            </Grid2>
            <Grid2 size={8}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="success"
                sx={{ mt: 2, mb: 2 }}
              >
                Submit
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </Paper>
    </Container>
  );
};

export default QueuePost;
