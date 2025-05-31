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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from "@mui/material";
import SchoolLogo from "../images/vsu-logo.png";
import { amber } from "@mui/material/colors";
import config from "../config";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import emailjs from "emailjs-com";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [emailAddress, setEmailAddress] = useState({});
  const [verificationCode, setVerificationCode] = useState(
    Math.floor(Math.random() * 899999 + 100000)
  );
  const [confirmVerificationCode, setConfirmVerificationCode] = useState({});

  const [student, setStudent] = useState([]);
  const [students, setStudents] = useState([]);

  const [sentEmail, setSentEmail] = useState(false);
  const [errorEmail, setErrorEmail] = useState(false);
  const [errorConfirmVerificationCode, setErrorConfirmVerificationCode] =
    useState(false);
  const [errorConfirmPassword, setConfirmPassword] = useState(false);

  const [showEmailAddress, setShowEmailAddress] = useState(true);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/students`).then(function (response) {
      //   console.log(response.data);
      setStudents(response.data);
    });
  }, []);

  const found = students.find((obj) => {
    return obj.Email_Address === emailAddress.Email_Address;
  });

  const handleChangeEmailAddress = (event) => {
    const value = event.target.value;
    setEmailAddress({
      ...emailAddress,
      [event.target.name]: value,
    });
  };

  const handleChangeConfirmVerificationCode = (event) => {
    const value = event.target.value;
    setConfirmVerificationCode({
      ...confirmVerificationCode,
      [event.target.name]: value,
    });
  };

  const handleSubmitEmailAddress = (e) => {
    e.preventDefault();

    // console.log(verificationCode);

    if (found) {
      setStudent(found);
      sendEmail(found);
    } else {
      setSentEmail(false);
      setErrorEmail(true);
      setErrorConfirmVerificationCode(false);

      setShowEmailAddress(true);
      setShowVerificationCode(false);
      setShowNewPassword(false);
    }
  };

  const sendEmail = (student) => {
    const templateParams = {
      Verification_Code: verificationCode,
      Email_Address: student.Email_Address,
    };

    emailjs
      .send(
        "service_a44eotc",
        "template_bpcflfw",
        templateParams,
        "JCUSScyWzhjLV0Xky"
      )
      .then((response) => {
        console.log("Email sent successfully", response);
        setSentEmail(true);
        setErrorEmail(false);
        setErrorConfirmVerificationCode(false);
        setShowEmailAddress(false);
        setShowVerificationCode(true);
        setShowNewPassword(false);
      })
      .catch((error) => {
        console.error("Error sending email", error);
      });
  };

  const handleSubmitVerificationCode = (e) => {
    e.preventDefault();
    if (verificationCode == confirmVerificationCode.Confirm_Verification_Code) {
      setSentEmail(false);
      setErrorEmail(false);
      setErrorConfirmVerificationCode(false);

      setShowEmailAddress(false);
      setShowVerificationCode(false);
      setShowNewPassword(true);
    } else {
      setSentEmail(false);
      setErrorEmail(false);
      setErrorConfirmVerificationCode(true);

      setShowEmailAddress(false);
      setShowVerificationCode(true);
      setShowNewPassword(false);
    }
  };

  const handleChangeNewPassword = (event) => {
    const value = event.target.value;
    setStudent({
      ...student,
      [event.target.name]: value,
    });
  };

  const handleSubmitNewPassword = (e) => {
    e.preventDefault();
    // console.log(student);
    if (student) {
      if (student.Password !== student.Confirm_Password) {
        setConfirmPassword(true);
      } else {
        // console.log(student);
        axios
          .put(
            `${config.API_BASE_URL}/api/put/user/student/` + student.Student_ID,
            student
          )
          .then(function (response) {
            console.log(response.data);
            if (response.data.errno) {
              setConfirmPassword(true);
            } else {
              setOpenDialog(true);
            }
          });
      }
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
          backgroundColor: amber[500],
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <img src={SchoolLogo} alt="Logo" width="50" />
        </Box>
        <Typography
          variant="h5"
          fontWeight={"bold"}
          align="center"
          color="white"
          gutterBottom
        >
          Forgot Password
        </Typography>
        {showEmailAddress && (
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Email Address"
              type="email"
              name="Email_Address"
              onChange={handleChangeEmailAddress}
            />
          </Box>
        )}

        {showVerificationCode && (
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Verification Code"
              type="text"
              name="Confirm_Verification_Code"
              onChange={handleChangeConfirmVerificationCode}
            />
          </Box>
        )}

        {showNewPassword && (
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="New Password"
              type="password"
              name="Password"
              onChange={handleChangeNewPassword}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              type="password"
              name="Confirm_Password"
              onChange={handleChangeNewPassword}
            />
          </Box>
        )}

        {sentEmail && (
          <Alert sx={{ mt: 2, mb: 2 }} severity="success">
            Check your email and input Verification Code!
          </Alert>
        )}

        {errorEmail && (
          <Alert sx={{ mt: 2, mb: 2 }} severity="warning">
            Email not Found!
          </Alert>
        )}

        {errorConfirmVerificationCode && (
          <Alert sx={{ mt: 2, mb: 2 }} severity="warning">
            Invalid Code!
          </Alert>
        )}

        {errorConfirmPassword && (
          <Alert sx={{ mt: 2, mb: 2 }} severity="warning">
            Password does not match!
          </Alert>
        )}

        <Grid2 container spacing={2}>
          <Grid2 size={4}>
            <Link
              to="/login"
              style={{ textDecoration: "none", color: "black" }}
            >
              <Button variant="contained" sx={{ mt: 2, mb: 2 }}>
                Cancel
              </Button>
            </Link>
          </Grid2>
          <Grid2 size={8}>
            {showEmailAddress && (
              <Button
                onClick={handleSubmitEmailAddress}
                fullWidth
                variant="contained"
                color="success"
                sx={{ mt: 2, mb: 2 }}
              >
                Get Code
              </Button>
            )}

            {showVerificationCode && (
              <Button
                onClick={handleSubmitVerificationCode}
                fullWidth
                variant="contained"
                color="success"
                sx={{ mt: 2, mb: 2 }}
              >
                Submit
              </Button>
            )}

            {showNewPassword && (
              <Button
                onClick={handleSubmitNewPassword}
                fullWidth
                variant="contained"
                color="success"
                sx={{ mt: 2, mb: 2 }}
              >
                Change Password
              </Button>
            )}
          </Grid2>
        </Grid2>
      </Paper>

      <Dialog open={openDialog}>
        <DialogContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CheckCircleOutlineIcon color="success" />
            <DialogContentText sx={{ color: "green" }}>
              Password changed!{" "}
              <span style={{ color: "black" }}>
                Click here to{" "}
                <Link
                  to="/login"
                  underline="none"
                  sx={{ textDecoration: "none" }}
                >
                  Login
                </Link>
                .
              </span>
            </DialogContentText>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ForgotPassword;
