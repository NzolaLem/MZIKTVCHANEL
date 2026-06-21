import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const npmCommand = isWindows ? 'npm.cmd' : 'npm'
let isShuttingDown = false

const children = [
  {
    name: 'api',
    command: process.execPath,
    args: ['--env-file-if-exists=.env', 'server/index.mjs'],
  },
  {
    name: 'web',
    command: npmCommand,
    args: ['run', 'dev:web'],
  },
].map(({ name, command, args }) => {
  const child = spawn(command, args, {
    env: process.env,
    stdio: 'inherit',
  })

  child.on('exit', (code, signal) => {
    if (isShuttingDown) {
      return
    }

    isShuttingDown = true
    stopChildren()
    process.exit(code ?? (signal ? 1 : 0))
  })

  return child
})

function stopChildren() {
  for (const child of children) {
    if (!child.killed) {
      child.kill()
    }
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    isShuttingDown = true
    stopChildren()
  })
}
