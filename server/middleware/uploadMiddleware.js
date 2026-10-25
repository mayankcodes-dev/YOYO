import multer from 'multer';

// C-2 FIX: Use memoryStorage instead of diskStorage.
//
// diskStorage writes files to the OS temp dir (/tmp on Lambda).
// On AWS Lambda:
//   • /tmp is a 512 MB ephemeral partition shared across warm invocations.
//   • Files written during one invocation persist across subsequent warm calls
//     and are never automatically cleaned up → memory leak / OOM risk.
//   • Cloudinary's upload() reads from `f.path` (disk), which is unavailable
//     when using memoryStorage.
//
// With memoryStorage, `f.buffer` holds the bytes in RAM.
// roomController uses `cloudinary.uploader.upload_stream()` to pipe the buffer
// directly to Cloudinary without touching disk.
// hotelController and userController already used upload_stream — no change needed.

const upload = multer({ storage: multer.memoryStorage() });

// Support both: import upload from '...' AND import { upload } from '...'
export { upload };
export default upload;
