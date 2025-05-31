import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { amber } from "@mui/material/colors";
import config from "../config";

const OfficePost = () => {
  const navigate = useNavigate();

  const [counter, setCounter] = useState({});

  const [counters, setCounters] = useState([]);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/counters`).then(function (response) {
      // console.log(response.data);
      setCounters(response.data);
    });
  }, []);

  const [error, setError] = useState("");

  const found = counters.find((obj) => {
    return obj.Assigned_Counter === counter.Assigned_Counter;
  });

  const handleChange = (event) => {
    const value = event.target.value;
    setCounter({
      ...counter,
      [event.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(counter);

    if (found) {
      setError("Office is already added!");
    } else {
      axios
        .post(`${config.API_BASE_URL}/api/post/counter`, counter)
        .then(function (response) {
          // console.log(response.data);
          navigate("/officelist");
          setError("");
        });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
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
          Add Office
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            required
            fullWidth
            label="Office Name"
            type="text"
            name="Assigned_Counter"
            onChange={handleChange}
          />
          {error && (
            <Typography sx={{ mt: 1 }} variant="h6" align="center" color="red">
              {error}
            </Typography>
          )}
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <Link
                to="/officelist"
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
                Add
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </Paper>
    </Container>
  );
};

export default OfficePost;
