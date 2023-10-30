
import { Readable, ReadableOptions } from "stream";
import * as fs from 'fs';

export function createBackwardReadStream(path: string, opts?: ReadableOptions): BackwardReadStream {
  return new BackwardReadStream(path, opts);
}

const NEWLINE_SEPARATOR = '\n';

class BackwardReadStream extends Readable {
  private incompleteData: string;     // store the incomplete data
  private fileOffset: number;         // file offset
  private fileName: string;           // file Name
  private fd: number | null;          // file descriptor

  constructor(filename: string, opts?: ReadableOptions) {
    super(opts);
    this.incompleteData = '';
    this.fileName = filename;
    this.fd = null;
    this.fileOffset = 0;
  }

  /**
   * The `_read()` method reads data out of the internal buffer and
   * returns it. If no data is available to be read, `null` is returned.
   */
  _read(size: number) {
    if ((this.fd === null) || (this.fileOffset === 0)) {
      this.push(null);
      return;
    }

    // Determine the size to read and offset of file from where to start read
    const readSize = (this.fileOffset - size) > 0 ? size : this.fileOffset;
    const fileOffsetToRead = (this.fileOffset - size) > 0 ? this.fileOffset - size : 0;

    const buf = Buffer.alloc(readSize);

    fs.read(this.fd, buf, 0, readSize, fileOffsetToRead, (err, readBytes) => {
      
      if (err) {
        this.destroy(err);
        this.push(null);
        return;
      } else {

        this.fileOffset = this.fileOffset - readBytes;

        if (!this.flushTheNewLineData(buf, readBytes)) {
          // To satisfy readable each call to `readable.read()` 
          // returns a chunk of data, or `null`
          this.push('');
        }

        // Last piece of data
        if (this.fileOffset === 0) {
          this.push(this.incompleteData + NEWLINE_SEPARATOR);
          this.push(null);
        }
      }
    });
  }

  /**
   * The `flushTheNewLineData()`flushes the complete newline data from internal buffer
   */
  private flushTheNewLineData(byteData: Buffer, lenDataRem: number): boolean {
    let pushedData = false;
    this.incompleteData = byteData.subarray(0, lenDataRem).toString() + this.incompleteData;

    // Split the buffer by lines
    const splittedLines = this.incompleteData.split(NEWLINE_SEPARATOR);

    // Save the data which will be flushed later (first element)
    this.incompleteData = splittedLines.shift() || '';

    // Flush the remaining lines
    splittedLines.reverse().forEach(element => {
      // Skip the empty element
      if (element !== '') {
        this.push(element + NEWLINE_SEPARATOR);
        pushedData = true;
      }
    });

    return pushedData;
  }

  /**
   * The `_construct()` method opens a file get size of a file and setup
   * starting offset.
   */
  _construct(callback: (error?: Error | null) => void) {
    fs.open(this.fileName, (err, fd) => {
      if (err) {
        callback(err);
      } else {
        fs.fstat(fd, (err, stats) => {
          if (err) {
            callback(err);
          } else {
            this.fd = fd;
            this.fileOffset = stats.size;
            callback(err);
          }
        });
      }
    });
  }

  /**
   * The `_destroy()` method closes the file descriptor
   */
  _destroy(err: Error | null, callback: (error?: Error | null) => void) {
    if (this.fd) {
      fs.close(this.fd, (er) => callback(er || err));
    } else {
      callback(err);
    }
  }
}
