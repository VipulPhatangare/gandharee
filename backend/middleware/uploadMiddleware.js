const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir('./uploads/images');
ensureDir('./uploads/models');

// Storage for food images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/images');
  },
  filename: (req, file, cb) => {
    const uniqueName = `dish-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Storage for 3D models
const modelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/models');
  },
  filename: (req, file, cb) => {
    const uniqueName = `model-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filters
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files allowed (jpeg, jpg, png, webp, gif)'));
  }
};

const modelFilter = (req, file, cb) => {
  const allowedTypes = /glb|gltf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only 3D model files allowed (glb, gltf)'));
  }
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadModel = multer({
  storage: modelStorage,
  fileFilter: modelFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Upload both image and model
const uploadFields = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'image') cb(null, './uploads/images');
      else cb(null, './uploads/models');
    },
    filename: (req, file, cb) => {
      const prefix = file.fieldname === 'image' ? 'dish' : 'model';
      cb(null, `${prefix}-${Date.now()}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = { uploadImage, uploadModel, uploadFields };
