import time

# Specify the output file and size in bytes (1GB)
output_file = "syslog_test"
desired_size = 1 * 1024 * 1024 * 1024  # 1GB

print(f"Log generation started.")

# Create the syslog data with timestamps and a dummy counter
with open(output_file, "w") as f:
    current_size = 0
    entry_count = 0
    while current_size < desired_size:
        timestamp = time.strftime("%b %d %H:%M:%S")
        log_entry = f"{timestamp} Entry {entry_count}: This is a log message.\n"
        f.write(log_entry)
        current_size += len(log_entry)
        entry_count += 1

print(f"Log generation complete. Total size: {current_size} bytes. Total entries: {entry_count}")
