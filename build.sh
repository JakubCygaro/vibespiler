#!/bin/bash

npm install .;
npm run build;
mkdir -p ./bin;
DISTPATH=$(realpath ./dist)
cat <<EOF > ./bin/vibesc
#!/bin/bash
node $DISTPATH/main.js \$@
EOF
chmod +x ./bin/vibesc
