type Tetro = {
    shape: [number, number][]
    dx: number
    dy: number
}

const shiftTetro = (tetro: Tetro, dx: number, dy: number): Tetro => ({
    ...tetro,
    dx: tetro.dx + dx,
    dy: tetro.dy + dy,
})

const withOrigin = (
    shape: [number, number][],
    [ox, oy]: [number, number],
): [number, number][] => shape.map(([x, y]) => [x - ox, y - oy])

const collapseTetro = (tetro: Tetro): [number, number][] =>
    tetro.shape.map(([x, y]) => [
        Math.round(x + tetro.dx),
        Math.round(y + tetro.dy),
    ])

const rotateTetro = (tetro: Tetro): Tetro => {
    return { ...tetro, shape: tetro.shape.map(([x, y]) => [-y, x]) }
}

const isColliding = (tetro: Tetro, boardCells: boolean[][]): boolean =>
    collapseTetro(tetro).some(([x, y]) => {
        if (
            y < 0 ||
            y >= boardCells.length ||
            x < 0 ||
            x >= boardCells[0].length
        ) {
            return false
        }
        return boardCells[y][x]
    })

const isTetroInBounds = (tetro: Tetro, xSize: number, ySize: number) =>
    collapseTetro(tetro).every(([x, y]) => 0 <= x && x < xSize && y < ySize)

const boundsFilter =
    (xSize: number, ySize: number) =>
    ([x, y]: [number, number]) =>
        0 <= x && x < xSize && 0 <= y && y < ySize

const keyToCmp =
    <T>(keyFn: (a: T) => number) =>
    (a: T, b: T): -1 | 0 | 1 => {
        const [ka, kb] = [keyFn(a), keyFn(b)]
        return ka < kb ? -1 : ka > kb ? 1 : 0
    }

const chooseWeighted = <T>(choices: [T, number][]): T => {
    const scale: [T, number][] = []
    let total = 0
    for (const [value, weight] of choices.sort(keyToCmp(([v, w]) => w))) {
        total += weight
        scale.push([value, total])
    }

    const w = Math.random() * total
    for (const [value, accum] of scale) {
        if (w <= accum) {
            return value
        }
    }
    throw new Error(`impossible! ${total}`)
}

const spawnTetro = (xSize: number, score: number) => {
    const shape = chooseWeighted(
        progression
            .filter((c) => c.minScore <= score)
            .map((c) => [c.shape, c.weight]),
    )
    let tetro = { shape, dx: Math.round(xSize / 2), dy: -2 }
    const rotateCount = Math.floor(Math.random() * 3.999)
    for (let i = 0; i < rotateCount; i++) {
        tetro = rotateTetro(tetro)
    }
    return tetro
}

type ShapeDef = {
    minScore: number
    weight: number
    shape: [number, number][]
}

const amongusShape = withOrigin(
    [
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [1, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 3],
        [1, 4],
        [3, 4],
    ],
    [2, 2.5],
)

const progression: ShapeDef[] = [
    {
        // Flat bar
        minScore: 0,
        weight: 80,
        shape: withOrigin(
            [
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
            ],
            [1.5, 0],
        ),
    },
    {
        // L
        minScore: 0,
        weight: 100,
        shape: withOrigin(
            [
                [0, 0],
                [1, 0],
                [2, 0],
                [2, -1],
            ],
            [1.5, 0],
        ),
    },
    {
        // Г
        minScore: 0,
        weight: 100,
        shape: withOrigin(
            [
                [0, 0],
                [1, 0],
                [2, 0],
                [2, 1],
            ],
            [1.5, 0],
        ),
    },
    {
        // T short
        minScore: 0,
        weight: 100,
        shape: withOrigin(
            [
                [0, 0],
                [1, 0],
                [1, 1],
                [1, -1],
            ],
            [1, 0],
        ),
    },
    {
        // Square
        minScore: 4,
        weight: 80,
        shape: withOrigin(
            [
                [0, 0],
                [0, 1],
                [1, 0],
                [1, 1],
            ],
            [0.5, 0.5],
        ),
    },
    {
        // Snake 1
        minScore: 4,
        weight: 100,
        shape: withOrigin(
            [
                [0, 0],
                [1, 0],
                [1, 1],
                [2, 1],
            ],
            [1, 0.5],
        ),
    },
    {
        // Snake 2
        minScore: 4,
        weight: 100,
        shape: withOrigin(
            [
                [0, 1],
                [1, 1],
                [1, 0],
                [2, 0],
            ],
            [1.5, 0.5],
        ),
    },
    {
        // T Long
        minScore: 10,
        weight: 80,
        shape: withOrigin(
            [
                [-1, 0],
                [0, 0],
                [1, 0],
                [1, 1],
                [1, -1],
            ],
            [1, 0],
        ),
    },
    {
        // Singular
        minScore: 10,
        weight: 30,
        shape: [[0, 0]],
    },
    {
        // The Donut of Death
        minScore: 10,
        weight: 30,
        shape: [
            [-1, 1],
            [0, 1],
            [1, 1],

            [-1, 0],
            [1, 0],

            [-1, -1],
            [0, -1],
            [1, -1],
        ],
    },
    {
        // Singular 2, to balance out the more cursed shapes
        minScore: 20,
        weight: 100,
        shape: [[0, 0]],
    },
    {
        // Amongus
        minScore: 30,
        weight: 10,
        shape: amongusShape,
    },
    // now this is where the fun begins
    {
        // Amongus 2
        minScore: 40,
        weight: 30,
        shape: amongusShape,
    },
    {
        // Short flat bar
        minScore: 45,
        weight: 200,
        shape: withOrigin(
            [
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
            ],
            [1.5, 0],
        ),
    },
    {
        // Short flat bar
        minScore: 45,
        weight: 100,
        shape: withOrigin(
            [
                [0, 0],
                [1, 0],
                [2, 0],
            ],
            [1, 0],
        ),
    },
    {
        // F short
        minScore: 50,
        weight: 100,
        shape: withOrigin(
            [
                [0, 0],
                [1, 0],
                [0, 1],
                [0, 2],
                [1, 2],
                [0, 3],
            ],
            [0.5, 1],
        ),
    },
]

// UI stuff

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

export const main = (root: HTMLElement) => {
    const xSize = 12
    const ySize = 24

    const tryUpdateTetro = (update: (t: Tetro) => Tetro) => {
        if (currentTetro === null) return false

        const newTetro = update(currentTetro)
        if (
            isTetroInBounds(newTetro, xSize, ySize) &&
            !isColliding(newTetro, boardCells)
        ) {
            currentTetro = newTetro
            paintCells()
            return true
        } else {
            return false
        }
    }

    const actions: Actions = {
        rotate: () => tryUpdateTetro(rotateTetro),
        left: () => tryUpdateTetro((t) => shiftTetro(t, -1, 0)),
        right: () => tryUpdateTetro((t) => shiftTetro(t, 1, 0)),
        down: () => tryUpdateTetro((t) => shiftTetro(t, 0, 1)),
        drop: () => {
            for (let i=0; i<ySize; i++) {
                actions.down()
            }
        }
    }

    root.focus()
    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "ArrowDown":
            case "v":
                actions.down()
                break
            case "ArrowUp":
            case "r":
                actions.rotate()
                break
            case "ArrowLeft":
                actions.left()
                break
            case "ArrowRight":
                actions.right()
                break
            case "d":
                actions.drop()
                onDrop()
                break
        }
    })

    const boardCells = range(ySize).map(() => range(xSize).map(() => false))

    const { node: tetrisGridNode, cellNodeAt } = createTetrisGrid(xSize, ySize)
    const { node: controlsNode } = createControls(actions)

    const scoreRow = document.createElement("div")
    scoreRow.className = "text-xl text-slate-600"

    const setScore = (score: number) => {
        currentScore = score
        scoreRow.innerText = `Score: ${score}`
    }

    scoreRow.innerText = ""

    const uiRow = document.createElement("div")
    uiRow.className =
        "flex flex-row gap-1 justify-items-stretch items-end gap-4 w-min p-4"

    uiRow.appendChild(tetrisGridNode)

    const rightCol = document.createElement("div")
    rightCol.appendChild(scoreRow)
    rightCol.appendChild(controlsNode)
    uiRow.appendChild(rightCol)

    root.appendChild(uiRow)

    const paintCells = () => {
        let tetroCells = currentTetro && collapseTetro(currentTetro)

        for (let y = 0; y < ySize; y++) {
            for (let x = 0; x < xSize; x++) {
                const color = boardCells[y][x]
                    ? isGameOver
                        ? "red-500"
                        : "sky-400"
                    : tetroCells &&
                      tetroCells.find(([tx, ty]) => tx == x && ty == y)
                    ? "emerald-400"
                    : "neutral-500"
                const node = cellNodeAt(x, y)
                node.className = node.className
                    .split(" ")
                    .filter((s) => !s.startsWith("bg-"))
                    .concat(`bg-${color}`)
                    .join(" ")
            }
        }
    }

    let currentScore = 0
    let currentTetro: Tetro | null = null
    let tetroDropCooldown = 10
    let isGameOver = false

    const clearRows = () => {
        for (let y = 0; y < ySize; y++) {
            if (boardCells[y].every((v) => v)) {
                setScore(currentScore + 1)
                for (let j = y - 1; j >= 0; j--) {
                    boardCells[j + 1] = boardCells[j]
                }
                boardCells[0] = range(xSize).map(() => false)
            }
        }
    }

    const onDrop = () => {
        if (!currentTetro)
            return

        tetroDropCooldown = 20
        const stillFalling = tryUpdateTetro((t) => shiftTetro(t, 0, 1))
        if (!stillFalling) {
            let tetroCells = collapseTetro(currentTetro)
            tetroCells
                .filter(boundsFilter(xSize, ySize))
                .forEach(([x, y]) => (boardCells[y][x] = true))
            if (tetroCells.every(boundsFilter(xSize, ySize))) {
                clearRows()
            } else {
                isGameOver = true
                console.log("Game over!")
            }
            currentTetro = null
        }
    }

    const tick = () => {
        if (isGameOver) {
            return
        }

        if (tetroDropCooldown > 0) {
            tetroDropCooldown--
        } else {
            if (currentTetro === null) {
                currentTetro = spawnTetro(xSize, currentScore)
            } else {
                onDrop()
            }
        }

        paintCells()
    }

    setScore(0)
    setInterval(tick, 1000 / 30)
}

type Actions = {
    rotate: () => void
    left: () => void
    right: () => void
    down: () => void
    drop: () => void
}

const createControls = (actions: Actions) => {
    const controlsNode = document.createElement("div")
    controlsNode.className =
        "grid grid-cols-3 grid-rows-2 justify-items-stretch w-40 h-24 gap-2"

    const leftButton = createButton(actions.left, "<")
    const rightButton = createButton(actions.right, ">")
    const downButton = createButton(actions.down, "V")
    const rotateButton = createButton(actions.rotate, "R")
    const dropButton = createButton(actions.drop, "D")

    rotateButton.classList.add("col-start-2")
    leftButton.classList.add("col-start-1")

    controlsNode.append(rotateButton, dropButton, leftButton, downButton, rightButton)

    return {
        node: controlsNode,
    }
}

const createButton = (onClick: () => void, text: string = "") => {
    const buttonNode = document.createElement("button")
    buttonNode.className =
        "px-2 py-1 bg-white border border-black rounded-lg hover:bg-slate-200 active:bg-slate-400 text-neutral-600 active:text-white"
    buttonNode.addEventListener("click", onClick)
    buttonNode.innerText = text
    return buttonNode
}

const createTetrisGrid = (xSize: number, ySize: number) => {
    const gridCells: HTMLElement[][] = []

    const tetrisGrid = document.createElement("div")
    tetrisGrid.className = "border border-black flex flex-col w-min"

    for (let y = 0; y < ySize; y++) {
        const row: HTMLElement[] = []
        const rowNode = document.createElement("div")
        rowNode.className = "flex flex-row w-min"
        for (let x = 0; x < xSize; x++) {
            const cellNode = document.createElement("div")
            cellNode.className =
                "w-5 h-5 bg-neutral-500"
            rowNode.appendChild(cellNode)
            row.push(cellNode)
        }
        tetrisGrid.appendChild(rowNode)
        gridCells.push(row)
    }

    return {
        node: tetrisGrid,
        cellNodeAt: (x: number, y: number): HTMLElement => {
            return gridCells[y][x]
        },
    }
}
