import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Box, Button, Typography, Container, Alert } from "@mui/material";
import { Link } from "react-router-dom";

const QRScanner = (props) => {
  const [qrResultInvalid, setQrResultInvalid] = useState(false);
  const [qrResultValid, setQrResultValid] = useState(false);
  const [qrResult, setQrResult] = useState(false);

  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  const [time, setTime] = useState(1200);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(300);
  };

  const startScanning = () => {
    if (scanning) return;

    startTimer();

    setQrResultInvalid(false);
    setScanning(true);

    scannerRef.current = new Html5Qrcode("reader");

    scannerRef.current
      .start(
        { facingMode: "environment" }, // Use rear camera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          console.log(props.Student_ID);
          if (props.Student_ID === decodedText) {
            const isValid = props.Student_ID === decodedText;
            setQrResultValid(isValid);
            setQrResultInvalid(!isValid);
            setQrResult(true);
            props.onScanResult?.(isValid); // <-- inform parent of result
            resetTimer();
            stopScanning();
          } else {
            setQrResultValid(false);
            setQrResultInvalid(true);
            setQrResult(true);
            resetTimer();
            stopScanning();
          }
        }
      )
      .catch((err) => {
        console.error("Scanner start failed: ", err);
        setScanning(false);
      });
  };

  const stopScanning = () => {
    if (scannerRef.current || scanning) {
      scannerRef.current
        .stop()
        .then(() => {
          resetTimer();
          setScanning(false);
          scannerRef.current = null; // Reset scanner instance
        })
        .catch((err) => console.error("Scanner stop failed: ", err));
    }
  };

  const rescan = () => {
    setQrResult(false);
    setQrResultInvalid(false);
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {qrResultInvalid && (
        <Box>
          <Alert severity="error">
            Invalid QR Code: The code is not recognized or not the student who
            filed this queue.{" "}
            <Link onClick={rescan} color="inherit">
              Rescan
            </Link>
          </Alert>
        </Box>
      )}

      {qrResultValid && (
        <Box>
          <Alert severity="success">
            QR Code Valid: The code has been successfully scanned. Proceeding to
            the next step.
          </Alert>
        </Box>
      )}

      {isRunning && (
        <>
          <Box
            gap={2}
            sx={{ mb: 3, alignItems: "center", textAlign: "center" }}
          >
            <Typography
              sx={{
                fontSize: 30,
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {time === 0 ? (
                <Alert severity="warning">
                  This queue is for cancellation, no student in front of the
                  counter.
                </Alert>
              ) : (
                formatTime(time)
              )}
            </Typography>
          </Box>
        </>
      )}
      {!qrResult && (
        <>
          <Box
            mb={2}
            display="flex"
            gap={2}
            flexWrap="wrap"
            justifyContent="center"
          >
            Scan QR Code here:{" "}
          </Box>
          <Box
            id="reader"
            sx={{
              width: { xs: "100%", sm: "300px" },
              height: { xs: "250px", sm: "225px" },
              border: "1px solid gray",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f9f9f9",
            }}
          />
          <Box
            mt={2}
            mb={2}
            display="flex"
            gap={2}
            flexWrap="wrap"
            justifyContent="center"
          >
            {!scanning ? (
              <Button
                variant="contained"
                color="primary"
                onClick={startScanning}
              >
                Start Scanning
              </Button>
            ) : (
              <Button variant="contained" color="error" onClick={stopScanning}>
                Stop
              </Button>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default QRScanner;
