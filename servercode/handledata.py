with open("data/pos.txt", encoding="utf8") as f:
    lines = f.readlines()
    for line in lines:
        entries = line.split()
        print("{value: '" + entries[0].strip() + "' , label: '" + entries[1].strip() + "' },")