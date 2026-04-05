HOW TO ADD PHOTOS (you do NOT send images to an AI chat)

1. On YOUR computer, put image files in this folder:
   public\media\

2. Supported names: .jpg, .jpeg, .png, .webp

3. The React app currently loads most pictures from src\assets\ (bundled at build time).
   Easiest ways to swap in your photos WITHOUT pasting them into a chat:
   - Replace an existing file in src\assets\ with the same filename (keep name identical), OR
   - Copy a new file into src\assets\ and in VS Code change the import path in the .tsx page to match your filename.

4. If the hotel sends a ZIP (WeTransfer, Drive, email):
   - Unzip on your PC
   - Copy chosen files into src\assets\ or public\media\
   - Rename to short ASCII names (e.g. room-deluxe.jpg) to avoid path issues on Windows.

5. No permission to use official site / Instagram photos?
   Use your own shots or royalty-free stock (e.g. search "moroccan riad interior" on Unsplash / Pexels),
   download, and drop them into src\assets\ the same way.

You only ever copy files inside your project folder — nothing is uploaded to Cursor for images to work.
