require('dotenv').config();
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

const app = express();
const PORT = process.env.PORT || 3500;

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your access key
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your secret key
    region: process.env.AWS_REGION // Your region
});

const s3 = new AWS.S3();

// Set up multer for S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            let folderPath = 'uploads'; // Default folder path
            if (req.query.folderPath) {
                folderPath = req.query.folderPath; // Use folder path from query if provided
            }
            cb(null, `${folderPath}/${Date.now().toString()}-${file.originalname}`);
        }
    })
});

// Endpoint to upload files
app.post('/uploads', upload.single('file'), (req, res) => {
    const filePath = req.file.key; // Get the key of the uploaded file which is the path within the bucket
    res.send({ message: 'File uploaded successfully', file: filePath });
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

console.log('S3 Bucket:', process.env.S3_BUCKET_NAME); 