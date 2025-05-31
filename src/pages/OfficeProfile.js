import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid2,
  Box,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { QRCodeSVG } from "qrcode.react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import config from "../config";
import { Password } from "@mui/icons-material";

const OfficeProfile = () => {
  const { id } = useParams();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [counter, setCounter] = useState({
    Assigned_Counter: "",
  });

  const [counters, setCounters] = useState([]);

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);

  const [error, setError] = useState("");

  let url;

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/counters`).then(function (response) {
      console.log(response.data);
      setCounters(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/counter/` + id)
      .then(function (response) {
        // console.log(response.data[0]);
        setCounter(response.data[0]);
      });
  }, []);

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

    if (counter) {
      if (found) {
        setError(counter.Assigned_Counter.toUpperCase() + " duplicate entry!");
      } else {
        axios
          .put(`${config.API_BASE_URL}/api/put/counter/` + id, counter)
          .then(function (response) {
            // console.log(response.data);
            if (response.data.errno) {
              setOpenWarning(true);
            } else {
              setOpenSuccess(true);

              navigate("/officelist");
            }
          });
      }
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
          marginTop: 4,
          marginBottom: 4,
          // backgroundColor: "black",
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Grid2 container spacing={2} justifyContent="center">
            <Grid2 item size={12}>
              <TextField
                sx={{ "& input": { textTransform: "uppercase" } }}
                margin="normal"
                required
                fullWidth
                label="Office Name"
                type="text"
                name="Assigned_Counter"
                value={counter.Assigned_Counter || ""}
                onChange={handleChange}
              />
            </Grid2>
          </Grid2>

          {error && (
            <Typography sx={{ mt: 1 }} variant="h6" align="center" color="red">
              {error}
            </Typography>
          )}

          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              {user?.Role === "administrator" && (
                <Link
                  to="/officelist"
                  style={{ textDecoration: "none", color: "black" }}
                >
                  <Button variant="contained" sx={{ mt: 2, mb: 2 }}>
                    Cancel
                  </Button>
                </Link>
              )}
            </Grid2>
            <Grid2 size={8}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                sx={{ mt: 2, mb: 2 }}
              >
                Save
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </Paper>

      <Snackbar
        open={openSuccess}
        autoHideDuration={3000}
        onClose={() => setOpenSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setOpenSuccess(false)}>
          Updated Profile
        </Alert>
      </Snackbar>

      <Snackbar
        open={openWarning}
        autoHideDuration={5000}
        onClose={() => setOpenWarning(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="warning" onClose={() => setOpenWarning(false)}>
          Office ID is already used
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OfficeProfile;
