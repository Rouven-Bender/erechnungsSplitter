package main

import (
	"fmt"
	"os"

	pdf "github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
)

func main() {
	path := "./testData/zugferd_invoice.pdf"
	file, err := os.Open(path)
	if err != nil {
		panic(err)
	}

	attcs, err := pdf.Attachments(file, &model.Configuration{})
	if err != nil {
		panic(err)
	}
	fmt.Println(len(attcs))
	pdf.ExtractAttachments(file, ".", []string{attcs[0].FileName}, &model.Configuration{})
}
