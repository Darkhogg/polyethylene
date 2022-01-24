#!/bin/bash
set -e
cd "$(dirname "$0")"

mkdir -vp ./etc ./docs

api-extractor run --local
api-documenter markdown -i ./etc -o ./docs
